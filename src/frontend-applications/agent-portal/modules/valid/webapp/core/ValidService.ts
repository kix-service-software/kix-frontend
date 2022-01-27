/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { ValidObject } from '../../model/ValidObject';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { SearchOperator } from '../../../search/model/SearchOperator';

export class ValidService extends KIXObjectService {

    private static INSTANCE: ValidService;

    public static getInstance(): ValidService {
        if (!ValidService.INSTANCE) {
            ValidService.INSTANCE = new ValidService();
        }
        return ValidService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.VALID_OBJECT);
        this.objectConstructors.set(KIXObjectType.VALID_OBJECT, [ValidObject]);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.VALID_OBJECT;
    }

    public getLinkObjectName(): string {
        return 'Valid';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.VALID_OBJECT) {
            objects = await super.loadObjects<O>(KIXObjectType.VALID_OBJECT, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public static async getValidObjectbyName(name: string): Promise<ValidObject> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [new FilterCriteria('Name', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, name)]
        );
        const validObjects = await KIXObjectService.loadObjects<ValidObject>(
            KIXObjectType.VALID_OBJECT, null, loadingOptions, null, true
        ).catch((error) => [] as ValidObject[]);

        return Array.isArray(validObjects) && validObjects.length
            ? validObjects[0]
            : null;
    }


}
