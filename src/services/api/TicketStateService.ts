import {
    TicketStateTypeResponse, TicketStateTypesResponse, TicketStateResponse, TicketStatesResponse, Query
} from '@kix/core/dist/api';

import { ITicketStateService } from '@kix/core/dist/services';
import { TicketState, StateType, SortOrder } from '@kix/core/dist/model';

import { ObjectService } from './ObjectService';

export class TicketStateService extends ObjectService<TicketState> implements ITicketStateService {

    protected RESOURCE_URI: string = "ticketstates";

    public async getTicketStates(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<TicketState[]> {

        const response = await this.getObjects<TicketStatesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.TicketState;
    }

    public async getTicketState(token: string, ticketStateId: number, query?: any): Promise<TicketState> {
        const response = await this.getObject<TicketStateResponse>(
            token, ticketStateId, query
        );

        return response.TicketState;
    }

    public async getTicketStateTypes(token: string, query?: any): Promise<StateType[]> {
        const uri = this.buildUri('statetypes');
        const response = await this.getObjectByUri<TicketStateTypesResponse>(token, uri, query);
        return response.StateType;
    }

    public async getTicketStateType(token: string, stateTypeId: number, query?: any): Promise<StateType> {
        const uri = this.buildUri('statetypes', stateTypeId);
        const response = await this.getObjectByUri<TicketStateTypeResponse>(token, uri, query);
        return response.StateType;
    }

}
