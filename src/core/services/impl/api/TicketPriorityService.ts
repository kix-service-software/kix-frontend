import {
    TicketPrioritiesResponse, UpdateTicketPriorityRequest, CreateTicketPriorityRequest,
    CreateTicketPriorityResponse, UpdateTicketPriorityResponse, UpdateTicketPriority, CreateTicketPriority
} from '../../../api';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, KIXObjectCache, TicketPriority, TicketPriorityCacheHandler, ObjectIcon
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';

export class TicketPriorityService extends KIXObjectService {

    private static INSTANCE: TicketPriorityService;

    public static getInstance(): TicketPriorityService {
        if (!TicketPriorityService.INSTANCE) {
            TicketPriorityService.INSTANCE = new TicketPriorityService();
        }
        return TicketPriorityService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'priorities';

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    private constructor() {
        super();
        KIXObjectServiceRegistry.getInstance().registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_PRIORITY;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;

        KIXObjectCache.registerCacheHandler(new TicketPriorityCacheHandler());

        await this.getTicketPriorities(token);
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
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
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createTicketPriority = new CreateTicketPriority(parameter);

        const response = await this.sendCreateRequest<CreateTicketPriorityResponse, CreateTicketPriorityRequest>(
            token, this.RESOURCE_URI, new CreateTicketPriorityRequest(createTicketPriority)
        ).catch((error) => {
            throw new Error(error.errorMessage.body);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Priority';
            icon.ObjectID = response.PriorityID;
            await this.createIcons(token, icon);
        }

        return response.PriorityID;
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateTicketType = new UpdateTicketPriority(parameter);

        const response = await this.sendUpdateRequest<UpdateTicketPriorityResponse, UpdateTicketPriorityRequest>(
            token, this.buildUri(this.RESOURCE_URI, objectId), new UpdateTicketPriorityRequest(updateTicketType)
        ).catch((error) => {
            throw new Error(error.errorMessage.body);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Priority';
            icon.ObjectID = response.PriorityID;
            await this.updateIcon(token, icon);
        }

        return response.PriorityID;
    }

    public async getTicketPriorities(token: string): Promise<TicketPriority[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.TICKET_PRIORITY)) {
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<TicketPrioritiesResponse>(token, uri);
            response.Priority
                .map((p) => new TicketPriority(p))
                .forEach((p) => KIXObjectCache.addObject(KIXObjectType.TICKET_PRIORITY, p));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.TICKET_PRIORITY);
    }
}
