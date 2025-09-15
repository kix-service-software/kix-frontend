/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import fs from 'fs';
import path from 'path';
import { IServerConfiguration } from '../model/IServerConfiguration';
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

    public getDataFileContents<T = any>(fileNameRegex: RegExp): Map<string, T> {
        const result = new Map();

        try {
            const filenames = fs.readdirSync(this.dataDir);
            for (const fn of filenames) {
                if (fn.match(fileNameRegex)) {
                    const content = this.getDataFileContent(fn, []);
                    result.set(fn, content);
                }
            }
        } catch (e) {
            LoggingService.getInstance().error(e);
        }

        return result;
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
            this.clearRequireCache(filePath);
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
