/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { Error } from '../../../../../server/model/Error';
import { TicketType } from '../model/TicketType';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';

export class TicketTypeAPIService extends KIXObjectAPIService {

    private static INSTANCE: TicketTypeAPIService;

    public static getInstance(): TicketTypeAPIService {
        if (!TicketTypeAPIService.INSTANCE) {
            TicketTypeAPIService.INSTANCE = new TicketTypeAPIService();
        }
        return TicketTypeAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'ticket', 'types');

    public objectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_TYPE;
    }

    protected getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        return TicketType;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TICKET_TYPE) {
            const hasValidFilter = loadingOptions?.filter?.length === 1 &&
                loadingOptions.filter[0].property === KIXObjectProperty.VALID_ID;

            objects = await super.load<TicketType>(
                token, KIXObjectType.TICKET_TYPE, this.RESOURCE_URI, null, null,
                KIXObjectType.TICKET_TYPE, clientRequestId, TicketType
            );

            if (hasValidFilter) {
                objects = objects.filter((o) => o.ValidID === loadingOptions.filter[0].value);
            }

            if (objectIds && objectIds.length) {
                objects = objects.filter((t) => objectIds.some((oid) => oid === t.ID));
            }
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, this.RESOURCE_URI, this.objectType, 'TypeID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, this.objectType, 'TypeID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

}
