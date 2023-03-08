/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { ValidObject } from '../model/ValidObject';

export class ValidObjectService extends KIXObjectAPIService {

    private static INSTANCE: ValidObjectService;

    public static getInstance(): ValidObjectService {
        if (!ValidObjectService.INSTANCE) {
            ValidObjectService.INSTANCE = new ValidObjectService();
        }
        return ValidObjectService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'valid');

    public objectType: KIXObjectType | string = KIXObjectType.VALID_OBJECT;

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.VALID_OBJECT;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.VALID_OBJECT) {
            objects = await super.load<ValidObject>(
                token, KIXObjectType.VALID_OBJECT, this.RESOURCE_URI, loadingOptions, objectIds, 'Valid',
                clientRequestId, ValidObject
            );
        }

        return objects;
    }

}
