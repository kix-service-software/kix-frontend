import { injectable, inject } from 'inversify';
import Plugins = require('js-plugins');

import { WidgetState } from './../components/base-components/widget/store/WidgetState';
import {
    IPluginService,
    IServerConfiguration,
    IConfigurationService,
    IWidgetFactoryExtension,
    IModuleFactoryExtension,
    KIXExtensions,
    WidgetType
} from '@kix/core';

const host = {
    debug: true
};

@injectable()
export class PluginService implements IPluginService {

    public pluginManager: any;

    public constructor( @inject("IConfigurationService") configurationService: IConfigurationService) {
        const serverConfiguration: IServerConfiguration = configurationService.getServerConfiguration();
        this.pluginManager = new Plugins();

        const pluginDirs = [];
        const fs = require('fs');
        for (const dir of serverConfiguration.PLUGIN_FOLDERS) {
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
                (err, extensions: T[], names) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(extensions);
                });
        });
    }

    public async getWidgetFactory(widgetId: string, type?: WidgetType): Promise<IWidgetFactoryExtension> {
        let extension = KIXExtensions.WIDGET;
        if (type === WidgetType.SIDEBAR) {
            extension = KIXExtensions.SIDEBAR;
        }
        const widgetFactories = await this.getExtensions<IWidgetFactoryExtension>(extension);
        const widgetFactory = widgetFactories.find((wf) => wf.getWidgetId() === widgetId);
        return widgetFactory;
    }

    public async getModuleFactory(moduleId: string): Promise<IModuleFactoryExtension> {
        const moduleFactories = await this.getExtensions<IModuleFactoryExtension>(KIXExtensions.MODUL);
        const moduleFactory = moduleFactories.find((mf) => mf.getModuleId() === moduleId);
        return moduleFactory;
    }
}
