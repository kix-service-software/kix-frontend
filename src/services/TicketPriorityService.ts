import { injectable, inject } from 'inversify';
import {
    IHttpService,
    ITicketPriorityService,
    TicketPriority,
    CreateTicketPriority,
    CreateTicketPriorityRequest,
    CreateTicketPriorityResponse,
    UpdateTicketPriority,
    UpdateTicketPriorityRequest,
    UpdateTicketPriorityResponse,
    TicketPriorityResponse,
    TicketPrioritiesResponse,
    SortOrder,
    Query
} from '@kix/core';

const RESOURCE_TICKET_PRIORITY = "priority";

@injectable()
export class TicketPriorityService implements ITicketPriorityService {

    private httpService: IHttpService;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getTicketPriorities(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<TicketPriority[]> {
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

        const response = await this.httpService.get<TicketPrioritiesResponse>(
            RESOURCE_TICKET_PRIORITY, query, token
        );

        return response.Priority;
    }

    public async getTicketPriority(token: string, ticketPriorityId: number, query?: any): Promise<TicketPriority> {
        if (!query) {
            query = {};
        }

        const uri = this.buildUrl(RESOURCE_TICKET_PRIORITY, ticketPriorityId);

        const response = await this.httpService.get<TicketPriorityResponse>(
            uri, query, token
        );

        return response.Priority;
    }

    public async createTicketPriority(token: string, createTicketPriority: CreateTicketPriority): Promise<number> {
        const response = await this.httpService.post<CreateTicketPriorityResponse>(
            RESOURCE_TICKET_PRIORITY, new CreateTicketPriorityRequest(createTicketPriority)
        );

        return response.PriorityID;
    }

    public async updateTicketPriority(
        token: string, ticketPriorityId: number, updateTicketPriority: UpdateTicketPriority
    ): Promise<number> {

        const uri = this.buildUrl(RESOURCE_TICKET_PRIORITY, ticketPriorityId);

        const response = await this.httpService.patch<UpdateTicketPriorityResponse>(
            uri, new UpdateTicketPriorityRequest(updateTicketPriority)
        );

        return response.PriorityID;
    }

    public async deleteTicketPriority(token: string, ticketPriorityId: number): Promise<void> {
        const uri = this.buildUrl(RESOURCE_TICKET_PRIORITY, ticketPriorityId);
        await this.httpService.delete(uri);
    }

    private buildUrl(...args): string {
        return args.join("/");
    }

}
