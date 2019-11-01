/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration, ConfigurationType } from "../../core/model/configuration";

import jsonfile = require('jsonfile');
import fs = require('fs');
import path = require('path');
import { Error } from "../../core/model";

export class ModuleConfigurationService {

    private static INSTANCE: ModuleConfigurationService;

    private configurationPath: string;

    public static getInstance(): ModuleConfigurationService {
        if (!ModuleConfigurationService.INSTANCE) {
            ModuleConfigurationService.INSTANCE = new ModuleConfigurationService();
        }
        return ModuleConfigurationService.INSTANCE;
    }

    private constructor() { }

    public setConfigurationPath(configurationPath: string): void {
        this.configurationPath = configurationPath;
    }

    public async saveConfiguration(configuration: IConfiguration): Promise<void> {
        this.validate(configuration);
        const configPath = this.getConfigurationPath(configuration);
        await this.saveConfigurationFile(configPath, configuration);
    }

    private getConfigurationPath(configuration: IConfiguration): string {
        return this.getConfigurationFilePath(configuration.type, configuration.id);
    }

    public async loadConfiguration<T extends IConfiguration>(type: string | ConfigurationType, id: string): Promise<T> {
        const configurationFilePath = this.getConfigurationFilePath(type, id);
        let configuration;
        if (fs.existsSync(configurationFilePath)) {
            this.clearRequireCache(configurationFilePath);
            try {
                configuration = require(configurationFilePath);
                this.validate(configuration);
                return configuration;
            } catch (error) {
                throw new Error("-1", error.toString());
            }
        }
    }

    public async loadConfigurations<T extends IConfiguration>(type: ConfigurationType): Promise<T[]> {
        const configDir = this.getConfigurationDirectoryPath(type);
        const fileNames = fs.readdirSync(configDir);

        const configurations = [];
        for (const file of fileNames) {
            const configId = file.replace('.json', '');
            const config = await this.loadConfiguration(type, configId);
            configurations.push(config);
        }

        return configurations;
    }

    private getConfigurationDirectoryPath(type: string | ConfigurationType): string {
        return path.join(this.configurationPath, 'defaults', type.toString());
    }

    private getConfigurationFilePath(type: string | ConfigurationType, id: string): string {
        const dir = path.join(this.configurationPath, 'defaults', type.toString());
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return path.join(dir, id + '.json');
    }

    private saveConfigurationFile(filePath: string, configuration: IConfiguration): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            jsonfile.writeFile(filePath, configuration,
                (fileError: Error) => {
                    if (fileError) {
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }

    private validate(configuration: IConfiguration): void {
        if (!configuration.id) {
            throw new Error("-1", 'Missing required property id.');
        }

        if (!configuration.type) {
            throw new Error("-1", 'Missing required property type.');
        }
    }

    private clearRequireCache(configurationFilePath: string): void {
        try {
            const config = require.resolve(configurationFilePath);
            if (require.cache[config]) {
                delete require.cache[config];
            }
        } catch (error) {
            return;
        }
    }

}
