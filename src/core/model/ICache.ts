export interface ICache {

    clear(): Promise<void>;

    has(key: string): Promise<boolean>;

    get(key: string): Promise<any>;

    set(key: string, cacheKeyPrefix: string, value: any): Promise<void>;

    delete(key: string, cacheKeyPrefix: string): Promise<void>;

    deleteKeys(cacheKeyPrefix: string): Promise<void>;

}
