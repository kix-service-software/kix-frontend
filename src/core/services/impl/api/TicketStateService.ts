import {
    TicketStatesResponse, TicketStateTypesResponse,
    CreateTicketStateResponse, CreateTicketStateRequest, CreateTicketState, UpdateTicketState,
    UpdateTicketStateResponse, UpdateTicketStateRequest
} from '../../../api';
import {
    TicketState, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, StateType, ObjectIcon, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';

export class TicketStateService extends KIXObjectService {

    private static INSTANCE: TicketStateService;

    public static getInstance(): TicketStateService {
        if (!TicketStateService.INSTANCE) {
            TicketStateService.INSTANCE = new TicketStateService();
        }
        return TicketStateService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'ticketstates';

    public objectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_STATE
            || kixObjectType === KIXObjectType.TICKET_STATE_TYPE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TICKET_STATE) {
            const ticketState = await this.getTicketStates(token);
            if (objectIds && objectIds.length) {
                objects = ticketState.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else {
                objects = ticketState;
            }
        } else if (objectType === KIXObjectType.TICKET_STATE_TYPE) {
            const stateTypes = await this.getTicketStateTypes(token);
            if (objectIds && objectIds.length) {
                objects = stateTypes.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else {
                objects = stateTypes;
            }
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createTicketState = new CreateTicketState(parameter.filter((p) => p[0] !== 'ICON'));

        const response = await this.sendCreateRequest<CreateTicketStateResponse, CreateTicketStateRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateTicketStateRequest(createTicketState), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'TicketState';
            icon.ObjectID = response.TicketStateID;
            await this.createIcons(token, clientRequestId, icon);
        }

        return response.TicketStateID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateTicketState = new UpdateTicketState(parameter);

        const response = await this.sendUpdateRequest<UpdateTicketStateResponse, UpdateTicketStateRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
            new UpdateTicketStateRequest(updateTicketState), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'TicketState';
            icon.ObjectID = response.TicketStateID;
            await this.updateIcon(token, clientRequestId, icon);
        }

        return response.TicketStateID;
    }

    public async getTicketStates(token: string): Promise<TicketState[]> {
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<TicketStatesResponse>(token, uri, {
            sort: 'TicketState.Name'
        });
        return response.TicketState.map((s) => new TicketState(s));
    }

    public async getTicketStateTypes(token: string): Promise<StateType[]> {
        const uri = this.buildUri('statetypes');
        const response = await this.getObjectByUri<TicketStateTypesResponse>(token, uri, {
            sort: 'StateType.Name'
        });
        return response.StateType.map((st) => new StateType(st));
    }
}
