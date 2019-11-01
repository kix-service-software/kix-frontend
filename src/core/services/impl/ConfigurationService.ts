/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IServerConfiguration, AppUtil } from '../../common';
import { FormContext, KIXObjectType } from '../../model';

import jsonfile = require('jsonfile');
import fs = require('fs');
import path = require('path');

import { LoggingService } from './LoggingService';
import { FormConfiguration } from '../../model/components/form/configuration';

export class ConfigurationService {

    private static INSTANCE: ConfigurationService;

    public static getInstance(): ConfigurationService {
        if (!ConfigurationService.INSTANCE) {
            ConfigurationService.INSTANCE = new ConfigurationService();
        }
        return ConfigurationService.INSTANCE;
    }

    private constructor() { }

    private static DEFAULT_CONFIG_DIR = 'defaults';
    private static USER_CONFIG_DIR = 'user';

    public configurationDirectory: string;
    public certDirectory: string;

    private serverConfiguration: IServerConfiguration;
    private lassoConfiguration: any;

    private forms: string[] = [];
    private formIDsWithContext: Array<[FormContext, KIXObjectType, string]> = [];

    public init(configurationDirectory: string, certDirectory: string): void {
        this.configurationDirectory = configurationDirectory;
        this.certDirectory = certDirectory;

        let lassoConfig = this.getConfigurationFilePath('lasso.dev.config.json');

        const serverConfig = this.getConfigurationFilePath('server.config.json');

        if (AppUtil.isProductionMode()) {
            lassoConfig = this.getConfigurationFilePath('lasso.prod.config.json');
        }

        this.serverConfiguration = this.loadServerConfig(serverConfig);

        this.clearRequireCache(lassoConfig);
        this.lassoConfiguration = require(lassoConfig);
    }

    public getServerConfiguration(): IServerConfiguration {
        return this.serverConfiguration;
    }

    public getLassoConfiguration(): any {
        return this.lassoConfiguration;
    }

    public getConfiguration<T = any>(configurationId: string, userId?: number): T {
        let filePath = this.getComponentConfigurationFilePath(configurationId + '.config.json');
        if (userId) {
            filePath = this.getUserConfigurationFilePath(configurationId + '.config.json', userId);
        }

        const moduleConfiguration = this.getConfigurationFile(filePath);
        return moduleConfiguration;
    }

    public async saveConfiguration(configurationId: string, configuration: any, userId?: number): Promise<void> {
        let filePath = this.getComponentConfigurationFilePath(configurationId + '.config.json');
        if (userId) {
            filePath = this.getUserConfigurationFilePath(configurationId + '.config.json', userId);
        }
        return this.saveConfigurationFile(filePath, configuration);
    }

    private getComponentConfigurationFilePath(fileName: string): string {
        const dir = path.join(this.configurationDirectory, ConfigurationService.DEFAULT_CONFIG_DIR);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return path.join(this.configurationDirectory, ConfigurationService.DEFAULT_CONFIG_DIR, fileName);
    }

    private getUserConfigurationFilePath(fileName: string, userId: number): string {
        const userConfigDir = this.getUserConfigDir(userId);
        return path.join(userConfigDir, fileName);
    }

    private getUserConfigDir(userId: number): string {
        const userDir = path.join(this.configurationDirectory, ConfigurationService.USER_CONFIG_DIR);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir);
        }

        const userConfigDir = path.join(userDir, userId.toString());
        if (!fs.existsSync(userConfigDir)) {
            fs.mkdirSync(userConfigDir);
        }

        return userConfigDir;
    }

    private saveConfigurationFile(filePath: string, configurationContent: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            jsonfile.writeFile(filePath, configurationContent,
                (fileError: Error) => {
                    if (fileError) {
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }

    private loadServerConfig(serverConfig: string): IServerConfiguration {
        this.clearRequireCache(serverConfig);
        const config: IServerConfiguration = require(serverConfig);

        // check if config option has been overridden by environment
        // tslint:disable-next-line:forin
        for (const key in config) {
            if (process.env[key]) {
                switch (typeof config[key]) {
                    case "number": {
                        config[key] = Number(process.env[key]);
                        break;
                    }
                    case "boolean": {
                        config[key] = (process.env[key] === 'true');
                        break;
                    }
                    case "object": {
                        config[key] = JSON.parse(process.env[key]);
                        break;
                    }
                    default: {
                        config[key] = process.env[key];
                    }
                }
            }
        }

        return config;
    }

    private getConfigurationFilePath(fileName: string): string {
        return path.join(this.configurationDirectory, fileName);
    }

    private getConfigurationFile(filePath: string): any {
        let configurationFile = null;
        if (fs.existsSync(filePath)) {
            this.clearRequireCache(filePath);
            try {
                configurationFile = require(filePath);
            } catch (error) {
                // do nothing
            }
        }

        return configurationFile;
    }

    private clearRequireCache(configPath: string): void {
        try {
            const config = require.resolve(configPath);
            if (require.cache[config]) {
                delete require.cache[config];
            }
        } catch (error) {
            return;
        }
    }

    public registerFormId(formId: string): void {
        if (!this.forms.some((fid) => fid === formId)) {
            this.forms.push(formId);
        }
    }

    public registerForm(formContext: FormContext[], formObject: KIXObjectType, formId: string): void {
        if (!this.forms.some((fid) => fid === formId)) {
            this.forms.push(formId);
        }

        formContext.forEach((fc) => {
            const fcIndex = this.formIDsWithContext.findIndex((fidwc) => fidwc[0] === fc && fidwc[1] === formObject);
            if (fcIndex === -1) {
                this.formIDsWithContext.push([fc, formObject, formId]);
            } else if (this.formIDsWithContext[fcIndex][2] !== formId) {
                LoggingService.getInstance().warning('A form replaces another form for specific context', {
                    'new form id': formId,
                    'old form id': this.formIDsWithContext[fcIndex][2],
                    'context': fc,
                    'object': formObject
                });
                this.formIDsWithContext[fcIndex] = [fc, formObject, formId];
            }
        });
    }

    public getRegisteredForms(): FormConfiguration[] {
        const result = [];
        for (const formId of this.forms) {
            const form = this.getConfiguration(formId);
            if (form) {
                result.push(form);
            }
        }

        return result;
    }

    public getFormIDsWithContext(): Array<[FormContext, KIXObjectType, string]> {
        return this.formIDsWithContext;
    }

}
