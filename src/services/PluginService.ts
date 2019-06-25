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
