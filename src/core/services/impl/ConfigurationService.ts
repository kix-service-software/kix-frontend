import { Environment, IServerConfiguration } from '../../common';
import { WidgetDescriptor, Form, FormContext, KIXObjectType, Bookmark } from '../../model';

import jsonfile = require('jsonfile');
import fs = require('fs');
import { FAQDetailsContext } from '../../browser/faq';
import { LoggingService } from './LoggingService';

export class ConfigurationService {

    private static INSTANCE: ConfigurationService;

    public static getInstance(): ConfigurationService {
        if (!ConfigurationService.INSTANCE) {
            ConfigurationService.INSTANCE = new ConfigurationService();
        }
        return ConfigurationService.INSTANCE;
    }

    private constructor() { }

    public configurationDirectory: string;
    public certDirectory: string;

    private serverConfiguration: IServerConfiguration;
    private lassoConfiguration: any;
    private preDefinedWidgetConfiguration: any;

    private forms: string[] = [];
    private formIDsWithContext: Array<[FormContext, KIXObjectType, string]> = [];

    private CONFIG_EXTENSION: string = '.config.json';

    public init(configurationDirectory: string, certDirectory: string): void {
        this.configurationDirectory = configurationDirectory;
        this.certDirectory = certDirectory;

        let lassoConfig = this.getConfigurationFilePath('lasso.dev');

        const serverConfig = this.getConfigurationFilePath('server');

        if (this.isProductionMode()) {
            lassoConfig = this.getConfigurationFilePath('lasso.prod');
        }

        this.serverConfiguration = this.loadServerConfig(serverConfig);

        this.clearRequireCache(lassoConfig);
        this.lassoConfiguration = require(lassoConfig);

        this.preDefinedWidgetConfiguration = require(this.getConfigurationFilePath("pre-defined-widgets"));
    }

    public getServerConfiguration(): IServerConfiguration {
        return this.serverConfiguration;
    }

    public getLassoConfiguration(): any {
        return this.lassoConfiguration;
    }

    public getPreDefinedWidgetConfiguration<T = any>(contextId: string): Array<WidgetDescriptor<T>> {
        return this.preDefinedWidgetConfiguration && this.preDefinedWidgetConfiguration[contextId]
            ? this.preDefinedWidgetConfiguration[contextId]
            : [];
    }

    public getModuleConfiguration(contextId: string, userId?: number): any {

        const configurationFileName = this.buildConfigurationFileName(contextId, userId);
        const filePath = this.getComponentConfigurationFilePath(configurationFileName);
        const moduleConfiguration = this.getConfigurationFile(filePath);

        return moduleConfiguration;
    }

    public async saveModuleConfiguration(
        contextId: string, userId: number, configuration: any): Promise<void> {

        const configurationFileName = this.buildConfigurationFileName(contextId, userId);
        const filePath = this.getComponentConfigurationFilePath(configurationFileName);

        return this.saveConfigurationFile(filePath, configuration);
    }

    public getComponentConfiguration(
        contextId: string, componentId: string, userId: number): any {

        const moduleConfiguration = this.getModuleConfiguration(contextId, userId);

        if (componentId === null) {
            componentId = contextId;
        }

        return moduleConfiguration ? moduleConfiguration[componentId] : undefined;
    }

    public async saveComponentConfiguration(
        contextId: string, componentId: string, userId: number, configuration: any): Promise<void> {

        if (componentId === null) {
            componentId = contextId;
        }

        const configurationFileName = this.buildConfigurationFileName(contextId, userId);
        const filePath = this.getComponentConfigurationFilePath(configurationFileName);
        const moduleConfiguration = this.getConfigurationFile(filePath) || {};
        moduleConfiguration[componentId] = configuration;

        return this.saveConfigurationFile(filePath, moduleConfiguration);
    }

    public isProductionMode(): boolean {
        const environment = this.getEnvironment();
        return environment === Environment.PRODUCTION ||
            (environment !== Environment.DEVELOPMENT && environment !== Environment.TEST);
    }

    public isDevelopmentMode(): boolean {
        return this.getEnvironment() === Environment.DEVELOPMENT;
    }

    public isTestMode(): boolean {
        return this.getEnvironment() === Environment.TEST;
    }

    private getEnvironment(): string {
        let nodeEnv = process.env.NODE_ENV;
        if (!nodeEnv) {
            nodeEnv = Environment.PRODUCTION;
        }

        return nodeEnv.toLocaleLowerCase();
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
        return this.configurationDirectory + fileName + this.CONFIG_EXTENSION;
    }

    private getComponentConfigurationFilePath(fileName: string): string {
        return this.configurationDirectory + '/components/' + fileName + this.CONFIG_EXTENSION;
    }

    private buildConfigurationFileName(contextId: string, userId?: number): string {
        let configurationFileName = contextId;

        if (userId) {
            configurationFileName = userId + '_' + configurationFileName;
        }

        return configurationFileName;
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

    public getRegisteredForms(): Form[] {
        const result = [];
        for (const formId of this.forms) {
            const form = this.getModuleConfiguration(formId, null);
            if (form) {
                result.push(form);
            }
        }

        return result;
    }

    public getFormIDsWithContext(): Array<[FormContext, KIXObjectType, string]> {
        return this.formIDsWithContext;
    }

    public getBookmarks(): Bookmark[] {
        let configuration: Bookmark[] = this.getModuleConfiguration('bookmarks');

        if (!configuration) {
            configuration = [
                new Bookmark(
                    'Translatable#How to use KIX 18 – Some general notes', 'kix-icon-faq', 1,
                    KIXObjectType.FAQ_ARTICLE, FAQDetailsContext.CONTEXT_ID
                ),
                new Bookmark(
                    'Translatable#How to search in KIX 18?', 'kix-icon-faq', 2,
                    KIXObjectType.FAQ_ARTICLE, FAQDetailsContext.CONTEXT_ID
                ),
                new Bookmark(
                    'Translatable#How to create a new ticket?', 'kix-icon-faq', 3,
                    KIXObjectType.FAQ_ARTICLE, FAQDetailsContext.CONTEXT_ID
                ),
                new Bookmark(
                    'Translatable#selected ticket features', 'kix-icon-faq', 4,
                    KIXObjectType.FAQ_ARTICLE, FAQDetailsContext.CONTEXT_ID
                )
            ];
            this.saveModuleConfiguration("bookmarks", null, configuration);
        }

        return configuration;
    }

}
