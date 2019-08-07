/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, Error, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, ValidObject
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ValidObjectFactory } from '../../object-factories/ValidObjectFactory';

export class ValidObjectService extends KIXObjectService {

    private static INSTANCE: ValidObjectService;

    public static getInstance(): ValidObjectService {
        if (!ValidObjectService.INSTANCE) {
            ValidObjectService.INSTANCE = new ValidObjectService();
        }
        return ValidObjectService.INSTANCE;
    }

    private constructor() {
        super([new ValidObjectFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'valid');

    public objectType: KIXObjectType = KIXObjectType.VALID_OBJECT;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.VALID_OBJECT;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.VALID_OBJECT) {
            objects = await super.load<ValidObject>(
                token, KIXObjectType.VALID_OBJECT, this.RESOURCE_URI, loadingOptions, objectIds, 'Valid'
            );
        }

        return objects;
    }

}
