/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import fs from 'fs';
import path from 'path';
import { IServerConfiguration } from '../model/IServerConfiguration';

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
    public dataDir: string;

    private serverConfiguration: IServerConfiguration;

    public init(configurationDirectory: string, certDirectory: string, dataDir: string): void {
        this.configurationDirectory = configurationDirectory;
        this.certDirectory = certDirectory;
        this.dataDir = dataDir;

        const serverConfig = this.getConfigurationFilePath('server.config.json');

        this.serverConfiguration = this.loadServerConfig(serverConfig);
    }

    public getServerConfiguration(): IServerConfiguration {
        return this.serverConfiguration;
    }

    public getDataFileContent<T = any>(fileName: string, defaultContent: any = {}): T {
        const filePath = path.join(this.dataDir, fileName);
        let fileContent = this.getJSONFileContent(filePath);
        if (!fileContent && defaultContent) {
            this.saveDataFileContent(fileName, defaultContent);
            fileContent = defaultContent;
        }
        return fileContent;
    }

    public saveDataFileContent(fileName: string, content: any): void {
        const filePath = path.join(this.dataDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(content));
    }

    private getComponentConfigurationFilePath(fileName: string): string {
        return path.join(this.configurationDirectory, fileName);
    }

    private loadServerConfig(serverConfig: string): IServerConfiguration {
        this.clearRequireCache(serverConfig);
        const config: IServerConfiguration = require(serverConfig);

        // check if config option has been overridden by environment
        // tslint:disable-next-line:forin
        for (const key in config) {
            if (process.env[key]) {
                switch (typeof config[key]) {
                    case 'number': {
                        config[key] = Number(process.env[key]);
                        break;
                    }
                    case 'boolean': {
                        config[key] = (process.env[key] === 'true');
                        break;
                    }
                    case 'object': {
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

    private getJSONFileContent(filePath: string): any {
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

}
