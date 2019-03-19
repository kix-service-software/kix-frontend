import {
    TicketPrioritiesResponse, UpdateTicketPriorityRequest, CreateTicketPriorityRequest,
    CreateTicketPriorityResponse, UpdateTicketPriorityResponse, UpdateTicketPriority, CreateTicketPriority
} from '../../../api';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, TicketPriority, ObjectIcon, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';
import { LoggingService } from '../LoggingService';

export class TicketPriorityService extends KIXObjectService {

    private static INSTANCE: TicketPriorityService;

    public static getInstance(): TicketPriorityService {
        if (!TicketPriorityService.INSTANCE) {
            TicketPriorityService.INSTANCE = new TicketPriorityService();
        }
        return TicketPriorityService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'priorities';

    public objectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_PRIORITY;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TICKET_PRIORITY) {
            const ticketTypes = await this.getTicketPriorities(token);
            if (objectIds && objectIds.length) {
                objects = ticketTypes.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else {
                objects = ticketTypes;
            }
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createTicketPriority = new CreateTicketPriority(parameter);

        const response = await this.sendCreateRequest<CreateTicketPriorityResponse, CreateTicketPriorityRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateTicketPriorityRequest(createTicketPriority),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Priority';
            icon.ObjectID = response.PriorityID;
            await this.createIcons(token, clientRequestId, icon);
        }

        return response.PriorityID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateTicketPriority = new UpdateTicketPriority(parameter);

        const response = await this.sendUpdateRequest<UpdateTicketPriorityResponse, UpdateTicketPriorityRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
            new UpdateTicketPriorityRequest(updateTicketPriority), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Priority';
            icon.ObjectID = response.PriorityID;
            await this.updateIcon(token, clientRequestId, icon);
        }

        return response.PriorityID;
    }

    public async getTicketPriorities(token: string): Promise<TicketPriority[]> {
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<TicketPrioritiesResponse>(token, uri);
        return response.Priority.map((p) => new TicketPriority(p));
    }
}
