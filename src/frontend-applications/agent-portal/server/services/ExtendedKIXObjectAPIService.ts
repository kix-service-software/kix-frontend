/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectService } from './IKIXObjectService';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { KIXObject } from '../../model/kix/KIXObject';
import { KIXObjectSpecificLoadingOptions } from '../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../model/KIXObjectSpecificCreateOptions';
import { KIXObjectSpecificDeleteOptions } from '../../model/KIXObjectSpecificDeleteOptions';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { Error } from '../../../../server/model/Error';
import { FilterCriteria } from '../../model/FilterCriteria';

export abstract class ExtendedKIXObjectAPIService implements IKIXObjectService {

    public isServiceFor(kixObjectType: string): boolean {
        return false;
    }

    public async loadDisplayValue(objectType: string, objectId: string | number): Promise<string> {
        return '';
    }

    public async loadObjects<T extends KIXObject = any>(
        token: string, clientRequestId: string, objectType: string, objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        return [];
    }

    public createObject(
        token: string, clientRequestId: string, objectType: string, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        return null;
    }

    public updateObject(
        token: string, clientRequestId: string, objectType: string, parameter: Array<[string, string]>,
        objectId: string | number, updateOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        return null;
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string
    ): Promise<Error[]> {
        return [];
    }

    public getAdditionalIncludes(objectType: KIXObjectType | string): string[] {
        return [];
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return null;
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return null;
    }

    public postPrepareParameter(parameter: Array<[string, string]>, additionalData?: any): void {
        return;
    }

    protected getParameterValue(parameter: Array<[string, any]>, property: string): any {
        const value = parameter.find((p) => p[0] === property);
        return value ? value[1] : undefined;
    }

}
