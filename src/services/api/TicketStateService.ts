import {
    TicketStateTypeResponse, TicketStateTypesResponse, TicketStateResponse, TicketStatesResponse, Query
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { ITicketStateService } from '@kix/core/dist/services';
import { TicketState, StateType } from '@kix/core/dist/model';

import { ObjectService } from './ObjectService';

export class TicketStateService extends ObjectService<TicketState> implements ITicketStateService {

    protected RESOURCE_URI: string = "statetypes";

    public async getTicketStates(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<TicketState[]> {

        const response = await this.getObjects<TicketStatesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.StateType;
    }

    public async getTicketState(token: string, ticketStateId: number, query?: any): Promise<TicketState> {
        const response = await this.getObject<TicketStateResponse>(
            token, ticketStateId, query
        );

        return response.StateType;
    }

    public async getTicketStateTypes(token: string, query?: any): Promise<StateType[]> {
        const response = await this.getObjects<TicketStateTypesResponse>(token, null, null, null, query);
        return response.StateType;
    }

    public async getTicketStateType(token: string, stateTypeId: number, query?: any): Promise<StateType> {
        const response = await this.getObject<TicketStateTypeResponse>(token, stateTypeId, query);
        return response.StateType;
    }

}
