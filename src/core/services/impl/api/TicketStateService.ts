import {
    CreateTicketStateResponse, CreateTicketStateRequest, CreateTicketState
} from '../../../api';
import {
    TicketState, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, StateType, ObjectIcon, Error, TicketStateFactory, TicketStateTypeFactory
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
        super([new TicketStateFactory(), new TicketStateTypeFactory()]);
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
            objects = await super.load<TicketState>(
                token, KIXObjectType.TICKET_STATE, this.RESOURCE_URI, loadingOptions, objectIds, 'TicketState'
            );
        } else if (objectType === KIXObjectType.TICKET_STATE_TYPE) {
            objects = await super.load<StateType>(
                token, KIXObjectType.TICKET_STATE_TYPE, 'statetypes', loadingOptions, objectIds, 'StateType'
            );
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
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.update(token, clientRequestId, parameter, uri, this.objectType, 'TicketStateID');
        return id;
    }

}
