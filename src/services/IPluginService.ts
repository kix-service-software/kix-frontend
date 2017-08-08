export interface IPluginService {

    getExtensions<T>(extensionId: string): Promise<T[]>;

}
