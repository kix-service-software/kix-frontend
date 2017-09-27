import { injectable, inject } from 'inversify';
import {
    IHttpService,
    ITicketStateService,
    TicketState,
    TicketStateResponse,
    TicketStatesResponse,
    SortOrder,
    Query
} from '@kix/core';

const RESOURCE_TICKET_STATES = "statetypes";

@injectable()
export class TicketStateService implements ITicketStateService {

    private httpService: IHttpService;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getTicketStates(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<TicketState[]> {
        if (!query) {
            query = {};
        }

        if (limit) {
            query[Query.LIMIT] = limit;
        }

        if (order) {
            query[Query.ORDER] = order;
        }

        if (changedAfter) {
            query[Query.CHANGED_AFTER] = changedAfter;
        }

        const response = await this.httpService.get<TicketStatesResponse>(
            RESOURCE_TICKET_STATES, query, token
        );

        return response.StateType;
    }

    public async getTicketState(token: string, ticketStateId: number, query?: any): Promise<TicketState> {
        if (!query) {
            query = {};
        }

        const uri = this.buildUrl(RESOURCE_TICKET_STATES, ticketStateId);

        const response = await this.httpService.get<TicketStateResponse>(
            uri, query, token
        );

        return response.StateType;
    }

    private buildUrl(...args): string {
        return args.join("/");
    }

}
