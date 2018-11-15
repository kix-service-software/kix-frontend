import Plugins = require('js-plugins');

import { IModuleFactoryExtension, KIXExtensions } from '@kix/core/dist/extensions';
import { LoggingService } from '@kix/core/dist/services';

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

    private constructor() {
        this.pluginManager = new Plugins();

        const pluginDirs = [];
        const fs = require('fs');

        // FIXME: use Plugin folders from configuration service
        const PLUGIN_FOLDERS = ["node_modules/@kix", "extensions"];
        for (const dir of PLUGIN_FOLDERS) {
            const path = __dirname + '/../../' + dir;
            pluginDirs.push(path);
        }

        this.pluginManager.scanSubdirs(pluginDirs);
        this.pluginManager.scan();
    }

    public initCache(): Promise<void> {
        return;
    }

    public async getExtensions<T>(extensionId: string): Promise<T[]> {
        return await new Promise<T[]>((resolve, reject) => {
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

    public async getModuleFactory(moduleId: string): Promise<IModuleFactoryExtension> {
        const moduleFactories = await this.getExtensions<IModuleFactoryExtension>(KIXExtensions.MODUL);
        return moduleFactories.find((mf) => mf.getModuleId() === moduleId);
    }

}
