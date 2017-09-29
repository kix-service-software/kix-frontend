import {
    IHttpService,
    ITicketTypeService,
    TicketType,
    CreateTicketTypeRequest,
    CreateTicketTypeResponse,
    UpdateTicketTypeRequest,
    UpdateTicketTypeResponse,
    TicketTypeResponse,
    TicketTypesResponse,
    SortOrder,
    Query
} from '@kix/core';
import { ObjectService } from './ObjectService';

export class TicketTypeService extends ObjectService<TicketType> implements ITicketTypeService {

    protected RESOURCE_URI: string = "tickettypes";

    public async getTicketTypes(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<TicketType[]> {

        const response = await this.getObjects<TicketTypesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.TicketType;
    }

    public async getTicketType(token: string, ticketTypeId: number, query?: any): Promise<TicketType> {
        const response = await this.getObject<TicketTypeResponse>(
            token, ticketTypeId
        );

        return response.TicketType;
    }

    public async createTicketType(token: string, name: string, validId: number): Promise<number> {
        const response = await this.createObject<CreateTicketTypeResponse, CreateTicketTypeRequest>(
            token, this.RESOURCE_URI, new CreateTicketTypeRequest(name, validId)
        );

        return response.TypeID;
    }

    public async updateTicketType(token: string, ticketTypeId: number, name: string, validId: any): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketTypeId);
        const response = await this.updateObject<UpdateTicketTypeResponse, UpdateTicketTypeRequest>(
            token, uri, new UpdateTicketTypeRequest(name, validId)
        );

        return response.TypeID;
    }

    public async deleteTicketType(token: string, ticketTypeId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketTypeId);
        await this.deleteObject<void>(token, uri);
    }

}
