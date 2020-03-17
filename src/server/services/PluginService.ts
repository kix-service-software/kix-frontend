/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import Plugins = require('js-plugins');
import { LoggingService } from './LoggingService';

const host = { debug: true };

export class PluginService {

    private static INSTANCE: PluginService;

    private extensionFolder: string[] = [];

    public static getInstance(): PluginService {
        if (!PluginService.INSTANCE) {
            PluginService.INSTANCE = new PluginService();
        }
        return PluginService.INSTANCE;
    }

    public pluginManager: any;

    private constructor() { }

    public init(extensionFolder: string[]): void {
        this.pluginManager = new Plugins();
        this.extensionFolder = extensionFolder.map((ef) => __dirname + '/../' + ef);
        this.scanPlugins();
    }

    public scanPlugins(): void {
        this.pluginManager.scanSubdirs(this.extensionFolder);
        this.pluginManager.scan();
    }

    public getExtensions<T>(extensionId: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const config = { multi: true };
            this.pluginManager.connect(host, extensionId, config,
                (error, extensions: T[], names) => {
                    if (error) {
                        LoggingService.getInstance().error('Error during http GET request.', error);
                        reject(error);
                    }
                    resolve(extensions);
                });
        });
    }

}
