/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from './tree';
import { IAutofillConfiguration } from './IAutofillConfiguration';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { IKIXService } from './IKIXService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { UIFilterCriterion } from '../../../../model/UIFilterCriterion';
import { KIXObjectSpecificDeleteOptions } from '../../../../model/KIXObjectSpecificDeleteOptions';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';

export interface IKIXObjectService<T extends KIXObject = KIXObject> extends IKIXService {

    loadObjects<O extends KIXObject>(
        kixObjectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache?: boolean, forceIds?: boolean
    ): Promise<O[]>;

    createObject(
        kixObjectType: KIXObjectType | string, object: KIXObject, createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number>;

    createObjectByForm(
        objectType: KIXObjectType | string, formId: string, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number | string>;

    updateObjectByForm(
        objectType: KIXObjectType | string, formId: string, objectId: number | string
    ): Promise<number | string>;

    prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]>;

    getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<TreeNode[]>;

    checkFilterValue(object: T, criteria: UIFilterCriterion): Promise<boolean>;

    determineDependendObjects(
        sourceObjects: T[], targetObjectType: KIXObjectType | string
    ): string[] | number[];

    getLinkObjectName(): string;

    deleteObject(
        objectType: KIXObjectType | string, objectId: string | number, deleteOptions?: KIXObjectSpecificDeleteOptions
    ): Promise<void>;

    getAutoFillConfiguration(textMatch: any, placeholder: string): Promise<IAutofillConfiguration>;

    getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string>;

    prepareObjectTree(
        objects: KIXObject[], showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>,
        translatable?: boolean
    ): Promise<TreeNode[]>;

    getObjectRoutingConfiguration(object?: KIXObject, property?: string): RoutingConfiguration;

    getObjectTypeForProperty(property: string): Promise<KIXObjectType | string>;

    getObjectProperties(objectType: KIXObjectType): Promise<string[]>;

}
