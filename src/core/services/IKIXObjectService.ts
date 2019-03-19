import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions,
    KIXObjectSpecificDeleteOptions
} from "../model";
import { IService } from "../common";

export interface IKIXObjectService extends IService {

    isServiceFor(kixObjectType: KIXObjectType): boolean;

    loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]>;

    createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number>;

    updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        objectId: number | string, updateOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number>;

    deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string
    ): Promise<void>;

}
