import {
    KIXObject, KIXObjectType, FilterCriteria, TreeNode,
    KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, KIXObjectSpecificDeleteOptions, TableFilterCriteria
} from "../../model";
import { IKIXService } from "./IKIXService";
import { IAutofillConfiguration } from "../components";

export interface IKIXObjectService<T extends KIXObject = KIXObject> extends IKIXService {

    loadObjects<O extends KIXObject>(
        kixObjectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache?: boolean
    ): Promise<O[]>;

    createObject(
        kixObjectType: KIXObjectType, object: KIXObject, createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number>;

    createObjectByForm(
        objectType: KIXObjectType, formId: string, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number | string>;

    updateObjectByForm(objectType: KIXObjectType, formId: string, objectId: number | string): Promise<number | string>;

    prepareFullTextFilter(searchValue: string): FilterCriteria[];

    getTreeNodes(property: string): Promise<TreeNode[]>;

    checkFilterValue(object: T, criteria: TableFilterCriteria): Promise<boolean>;

    determineDependendObjects(
        sourceObjects: T[], targetObjectType: KIXObjectType
    ): string[] | number[];

    getLinkObjectName(): string;

    deleteObject(
        objectType: KIXObjectType, objectId: string | number, deleteOptions?: KIXObjectSpecificDeleteOptions
    ): Promise<void>;

    getAutoFillConfiguration(textMatch: any, placeholder: string): IAutofillConfiguration;

    getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string>;

}
