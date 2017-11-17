import {
    IHttpService,
    ITicketPriorityService,
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

import { TicketPriority } from '@kix/core/dist/model/client/ticket';

import { ObjectService } from './ObjectService';

export class TicketPriorityService extends ObjectService<TicketPriority> implements ITicketPriorityService {

    protected RESOURCE_URI: string = "priorities";

    public async getTicketPriorities(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<TicketPriority[]> {

        const response = await this.getObjects<TicketPrioritiesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Priority;
    }

    public async getTicketPriority(token: string, ticketPriorityId: number, query?: any): Promise<TicketPriority> {
        const response = await this.getObject<TicketPriorityResponse>(
            token, ticketPriorityId
        );

        return response.Priority;
    }

    public async createTicketPriority(token: string, createTicketPriority: CreateTicketPriority): Promise<number> {
        const response = await this.createObject<CreateTicketPriorityResponse, CreateTicketPriorityRequest>(
            token, this.RESOURCE_URI, new CreateTicketPriorityRequest(createTicketPriority)
        );

        return response.PriorityID;
    }

    public async updateTicketPriority(
        token: string, ticketPriorityId: number, updateTicketPriority: UpdateTicketPriority
    ): Promise<number> {

        const uri = this.buildUri(this.RESOURCE_URI, ticketPriorityId);

        const response = await this.updateObject<UpdateTicketPriorityResponse, UpdateTicketPriorityRequest>(
            token, uri, new UpdateTicketPriorityRequest(updateTicketPriority)
        );

        return response.PriorityID;
    }

    public async deleteTicketPriority(token: string, ticketPriorityId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketPriorityId);
        await this.deleteObject(token, uri);
    }

}
