/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObject, KIXObjectType, FilterCriteria, TreeNode,
    KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, KIXObjectSpecificDeleteOptions, TableFilterCriteria, FormFieldOption
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

    prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]>;

    getTreeNodes(
        property: string, showInvalid?: boolean, filterIds?: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]>;

    checkFilterValue(object: T, criteria: TableFilterCriteria): Promise<boolean>;

    determineDependendObjects(
        sourceObjects: T[], targetObjectType: KIXObjectType
    ): string[] | number[];

    getLinkObjectName(): string;

    deleteObject(
        objectType: KIXObjectType, objectId: string | number, deleteOptions?: KIXObjectSpecificDeleteOptions
    ): Promise<void>;

    getAutoFillConfiguration(textMatch: any, placeholder: string): Promise<IAutofillConfiguration>;

    getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string>;

    prepareObjectTree(
        objects: KIXObject[], showInvalid?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]>;

}
