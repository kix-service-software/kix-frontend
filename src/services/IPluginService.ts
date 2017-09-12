import { IWidgetFactoryExtension } from './../extensions/IWidgetExtension';
export interface IPluginService {

    pluginManager: any;

    getExtensions<T>(extensionId: string): Promise<T[]>;

    getWidgetFactory(widgetId: string): Promise<IWidgetFactoryExtension>;

}
