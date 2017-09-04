export interface IPluginService {

    pluginManager: any;

    getExtensions<T>(extensionId: string): Promise<T[]>;

}
