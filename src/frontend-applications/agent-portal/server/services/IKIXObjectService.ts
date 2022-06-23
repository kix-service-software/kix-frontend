/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IService } from './IService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObject } from '../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../model/KIXObjectSpecificCreateOptions';
import { KIXObjectSpecificDeleteOptions } from '../../model/KIXObjectSpecificDeleteOptions';
import { Error } from '../../../../server/model/Error';

export interface IKIXObjectService extends IService {

    isServiceFor(kixObjectType: KIXObjectType | string): boolean;

    loadObjects<T extends KIXObject = any>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]>;

    createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number>;

    updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, string]>,
        objectId: number | string, updateOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number>;

    deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string
    ): Promise<Error[]>;

    loadDisplayValue(objectType: KIXObjectType | string, objectId: string | number): Promise<string>;

}
