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
import { LoggingService } from './LoggingService';

export class ConfigurationService {

    private static INSTANCE: ConfigurationService;
    private static loggedEnv: Map<string, boolean> = new Map();

    public static getInstance(): ConfigurationService {
        if (!ConfigurationService.INSTANCE) {
            ConfigurationService.INSTANCE = new ConfigurationService();
        }
        return ConfigurationService.INSTANCE;
    }

    private constructor() { }

    public dataDir: string;

    public init(dataDir: string): void {
        this.dataDir = dataDir;
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

    public static isEnvSetTrue(env: string): boolean {
        this.logEnv(env);
        return process.env[env] === 'true' || Number(process.env[env]) === 1;
    }

    public static getEnvNumber(env: string, defaultValue?: number): number {
        this.logEnv(env);
        if (!process.env[env] && defaultValue)
            return defaultValue;
        return Number(process.env[env]);
    }

    public static getEnvString(env: string, defaultValue?: string): string {
        this.logEnv(env);
        if (!process.env[env] && defaultValue)
            return defaultValue;
        return process.env[env];
    }

    public static getBackendAPIToken(): string {
        return ConfigurationService.getEnvString('BACKEND_API_TOKEN');
    }

    private static logEnv(env: string): void {
        if (!this.loggedEnv.has(env)) {
            LoggingService.getInstance().info(`[SERVER] READ ENV: ${env}`);
            this.loggedEnv.set(env, true);
        }
    }

}
