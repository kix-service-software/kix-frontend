/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    TicketType, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import { TicketTypeFactory } from '../../object-factories/TicketTypeFactory';

export class TicketTypeService extends KIXObjectService {

    private static INSTANCE: TicketTypeService;

    public static getInstance(): TicketTypeService {
        if (!TicketTypeService.INSTANCE) {
            TicketTypeService.INSTANCE = new TicketTypeService();
        }
        return TicketTypeService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'ticket', 'types');

    public objectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

    private constructor() {
        super([new TicketTypeFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_TYPE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TICKET_TYPE) {
            objects = await super.load<TicketType>(
                token, KIXObjectType.TICKET_TYPE, this.RESOURCE_URI, loadingOptions, objectIds, 'TicketType'
            );
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
