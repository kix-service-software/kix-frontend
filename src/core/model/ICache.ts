export interface ICache {

    clear(ignoreKeyPrefixes?: string[]): Promise<void>;

    get(key: string, cacheKeyPrefix: string): Promise<any>;

    set(key: string, cacheKeyPrefix: string, value: any): Promise<void>;

    delete(key: string, cacheKeyPrefix: string): Promise<void>;

    deleteKeys(cacheKeyPrefix: string): Promise<void>;

}
