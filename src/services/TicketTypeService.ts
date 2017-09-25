import { injectable, inject } from 'inversify';
import {
    IHttpService,
    ITicketTypeService,
    TicketType,
    TicketTypeResponse,
    TicketTypesResponse,
    SortOrder,
    Query
} from '@kix/core';

@injectable()
export class TicketTypeService implements ITicketTypeService {

    private TICKETTYPES_RESOURCE_URI: string = "tickettypes";

    private httpService: IHttpService;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getTicketTypes(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any): Promise<TicketType[]> {
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

        const response = await this.httpService.get<TicketTypesResponse>(
            this.TICKETTYPES_RESOURCE_URI, query, token
        );

        return response.TicketType;
    }

    public async getTicketType(token: string, ticketTypeId: number, query?: any): Promise<TicketType> {
        if (!query) {
            query = {};
        }

        const response = await this.httpService.get<TicketTypeResponse>(
            this.TICKETTYPES_RESOURCE_URI + '/' + ticketTypeId, query, token
        );

        return response.TicketType;
    }

    public createTicketType(token: string, name: string, validId: number): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public updateTicketType(token: string, ticketTypeId: number, name: string, validId: any): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public deleteTicketType(token: string, ticketTypeId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
