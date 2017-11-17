import {
    IHttpService,
    ITicketStateService,
    TicketStateResponse,
    TicketStatesResponse,
    SortOrder,
    Query
} from '@kix/core';

import { TicketState } from '@kix/core/dist/model/client/ticket';

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

}
