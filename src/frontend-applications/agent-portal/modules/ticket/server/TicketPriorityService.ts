/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TicketPriority } from '../model/TicketPriority';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { Error } from '../../../../../server/model/Error';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { TicketPriorityProperty } from '../model/TicketPriorityProperty';

export class TicketPriorityAPIService extends KIXObjectAPIService {

    private static INSTANCE: TicketPriorityAPIService;

    public static getInstance(): TicketPriorityAPIService {
        if (!TicketPriorityAPIService.INSTANCE) {
            TicketPriorityAPIService.INSTANCE = new TicketPriorityAPIService();
        }
        return TicketPriorityAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'ticket', 'priorities');

    public objectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_PRIORITY;
    }

    public getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        return TicketPriority;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse<TicketPriority>();
        if (objectType === KIXObjectType.TICKET_PRIORITY) {
            objectResponse = await super.load<TicketPriority>(
                token, KIXObjectType.TICKET_PRIORITY, this.RESOURCE_URI, loadingOptions, objectIds,
                KIXObjectType.TICKET_PRIORITY, clientRequestId, TicketPriority
            );
        }

        return objectResponse as any;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const id = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, parameter, this.RESOURCE_URI, this.objectType, 'PriorityID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, parameter, uri, this.objectType, 'PriorityID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

}
