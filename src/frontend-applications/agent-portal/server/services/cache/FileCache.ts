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
import { ICache } from './ICache';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';

export class FileCache implements ICache {

    private static INSTANCE: FileCache;

    private KIX_CACHE_PREFIX = 'KIXWebAPP';

    private dataDir: string;

    public static getInstance(): FileCache {
        if (!FileCache.INSTANCE) {
            FileCache.INSTANCE = new FileCache();
        }
        return FileCache.INSTANCE;
    }

    private constructor() {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        this.dataDir = config.FILE_CACHE_DIR;
        if (!this.dataDir)
            this.dataDir = path.join(ConfigurationService.getInstance().dataDir, '..', 'cache');

        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    public async waitFor(key: string, cacheType: string): Promise<void> {
        return;
    }

    public async clear(ignoreTypes: string[] = []): Promise<void> {
        LoggingService.getInstance().info('Clear Cache: (ignore) ' + ignoreTypes.join(', '));
        let types;
        try {
            types = fs.readdirSync(path.join(this.dataDir, this.KIX_CACHE_PREFIX)).filter(function (file) {
                return fs.statSync(path + '/' + file).isDirectory();
            });
        } catch {
            return null;
        }

        console.table(types);
        types = types.filter((k) => !ignoreTypes.some((p) => k.startsWith(p)));
        for (const type of types) {
            this.deleteAll(type);
        }
    }

    public async get(type: string, key: string): Promise<any> {
        let value;
        try {
            value = this.getCacheFileContent(type, key);
            value = JSON.parse(value);
        } catch {
            // do nothing ...
        }

        return value;
    }

    public async getAll(type: string): Promise<any[]> {
        const values = [];
        try {
            const keys = fs.readdirSync(path.join(this.dataDir, this.KIX_CACHE_PREFIX)).filter(function (file) {
                return fs.statSync(path + '/' + file).isFile();
            });
            keys.forEach((key) => {
                values.push(this.getCacheFileContent(type, key));
            });
        } catch {
            return null;
        }

        return values;
    }

    public async set(type: string, key: string, value: any): Promise<void> {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        try {
            this.saveCacheFileContent(type, key, value);
        } catch {
            // do nothing
        }
    }

    public async delete(type: string, key: string): Promise<void> {
        try {
            const cacheFile = path.join(this.dataDir, this.KIX_CACHE_PREFIX, type, key);
            fs.rmSync(cacheFile);
        } catch {
            // do nothing
        }
    }

    public async deleteAll(type: string): Promise<void> {
        LoggingService.getInstance().debug(
            `File Cache: delete type ${type}`
        );
        try {
            const cacheDir = path.join(this.dataDir, this.KIX_CACHE_PREFIX, type);
            fs.rmdirSync(cacheDir, { recursive: true });
        }
        catch {
            // do nothing
        }
    }

    public getCacheFileContent<T = any>(type: string, key: string, defaultContent: any = {}): T {
        const cacheDir = path.join(this.dataDir, this.KIX_CACHE_PREFIX, type);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        const filePath = path.join(cacheDir, key);
        const fileContent = fs.readFileSync(filePath);
        return JSON.parse(fileContent.toString());
    }

    public saveCacheFileContent(type: string, key: string, content: any): void {
        const cacheDir = path.join(this.dataDir, this.KIX_CACHE_PREFIX, type);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        const filePath = path.join(cacheDir, key);
        fs.writeFileSync(filePath, JSON.stringify(content));
    }
}
