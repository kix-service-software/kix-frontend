import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions,
    KIXObjectSpecificDeleteOptions
} from "../model";
import { IService } from "../common";

export interface IKIXObjectService extends IService {

    isServiceFor(kixObjectType: KIXObjectType): boolean;

    loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]>;

    createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number>;

    updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        objectId: number | string, updateOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number>;

    deleteObject(
        token: string, objectType: KIXObjectType, objectId: string | number,
        deleteOptions?: KIXObjectSpecificDeleteOptions
    ): Promise<void>;

    updateCache(objectId: number | string): void;
}
