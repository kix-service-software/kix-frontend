/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import Plugins = require('js-plugins');

import { IConfigurationExtension, KIXExtensions } from '../core/extensions';
import { LoggingService } from '../core/services';

const host = { debug: true };

export class PluginService {

    private static INSTANCE: PluginService;

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

        extensionFolder = extensionFolder.map((ef) => __dirname + '/../' + ef);

        this.pluginManager.scanSubdirs(extensionFolder);
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

    public async getConfigurationExtension(moduleId: string): Promise<IConfigurationExtension> {
        const configExtensions = await this.getExtensions<IConfigurationExtension>(KIXExtensions.CONFIGURATION);
        return configExtensions.find((mf) => mf.getModuleId() === moduleId);
    }

}
