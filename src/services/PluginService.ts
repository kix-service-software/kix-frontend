import { injectable, inject } from 'inversify';
import Plugins = require('js-plugins');

import { IModuleFactoryExtension, KIXExtensions } from '@kix/core/dist/extensions';
import { IPluginService, IConfigurationService, ILoggingService } from '@kix/core/dist/services';
import { IServerConfiguration } from '@kix/core/dist/common';

const host = { debug: true };

@injectable()
export class PluginService implements IPluginService {

    public pluginManager: any;

    public constructor(
        @inject("ILoggingService") protected loggingService: ILoggingService,
        @inject("IConfigurationService") protected configurationService: IConfigurationService) {
        const serverConfiguration: IServerConfiguration = configurationService.getServerConfiguration();
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

    public async getExtensions<T>(extensionId: string): Promise<T[]> {
        return await new Promise<T[]>((resolve, reject) => {
            const config = { multi: true };
            this.pluginManager.connect(host, extensionId, config,
                (error, extensions: T[], names) => {
                    if (error) {
                        this.loggingService.error('Error during http GET request.', error);
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
