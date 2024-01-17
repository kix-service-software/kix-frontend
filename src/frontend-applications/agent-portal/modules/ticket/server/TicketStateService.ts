/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { TicketState } from '../model/TicketState';
import { StateType } from '../model/StateType';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { TicketStateType } from '../model/TicketStateType';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { TicketStateProperty } from '../model/TicketStateProperty';

export class TicketStateAPIService extends KIXObjectAPIService {

    private static INSTANCE: TicketStateAPIService;

    public static getInstance(): TicketStateAPIService {
        if (!TicketStateAPIService.INSTANCE) {
            TicketStateAPIService.INSTANCE = new TicketStateAPIService();
        }
        return TicketStateAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'ticket', 'states');

    public objectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_STATE
            || kixObjectType === KIXObjectType.TICKET_STATE_TYPE;
    }

    public getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        let objectClass;

        if (objectType === KIXObjectType.TICKET_STATE) {
            objectClass = TicketState;
        } else if (objectType === KIXObjectType.TICKET_STATE_TYPE) {
            objectClass = TicketStateType;
        }
        return objectClass;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse<TicketState | TicketStateType>();
        if (objectType === KIXObjectType.TICKET_STATE) {
            const hasValidFilter = loadingOptions?.filter?.length === 1 &&
                loadingOptions.filter[0].property === KIXObjectProperty.VALID_ID;
            const hasNameFilter = loadingOptions?.filter?.length === 1 &&
                loadingOptions.filter[0].property === TicketStateProperty.NAME;

            objectResponse = await super.load<TicketState>(
                token, KIXObjectType.TICKET_STATE, this.RESOURCE_URI, null, null,
                KIXObjectType.TICKET_STATE, clientRequestId, TicketState
            );

            if (hasValidFilter) {
                objectResponse.objects = objectResponse.objects?.filter(
                    (o) => o.ValidID === loadingOptions.filter[0].value
                );
            } else if (hasNameFilter) {
                objectResponse.objects = objectResponse?.objects?.filter(
                    (o) => o.Name === loadingOptions.filter[0].value
                );
            }

            if (objectIds && objectIds.length) {
                objectResponse.objects = objectResponse.objects?.filter(
                    (t) => objectIds.some((oid) => oid?.toString() === t.ID?.toString())
                );
            }
        } else if (objectType === KIXObjectType.TICKET_STATE_TYPE) {
            const uri = this.buildUri(this.RESOURCE_URI, 'types');
            objectResponse = await super.load<StateType>(
                token, KIXObjectType.TICKET_STATE_TYPE, uri, loadingOptions, objectIds, KIXObjectType.TICKET_STATE_TYPE,
                clientRequestId, StateType
            );
        }

        return objectResponse as any;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, this.RESOURCE_URI, this.objectType, 'TicketStateID', true
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
            token, clientRequestId, parameter, uri, this.objectType, 'TicketStateID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

}
