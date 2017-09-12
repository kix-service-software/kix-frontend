import { IModuleFactoryExtension, IWidgetFactoryExtension } from './../extensions/';

export interface IPluginService {

    pluginManager: any;

    getExtensions<T>(extensionId: string): Promise<T[]>;

    getWidgetFactory(widgetId: string): Promise<IWidgetFactoryExtension>;

    getModuleFactory(moduleId: string): Promise<IModuleFactoryExtension>;

}
