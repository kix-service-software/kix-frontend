import { injectable, inject } from 'inversify';
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

    public async createTicketType(token: string, name: string, validId: number): Promise<number> {
        const response = await this.httpService.post<CreateTicketTypeResponse>(
            this.TICKETTYPES_RESOURCE_URI, new CreateTicketTypeRequest(name, validId)
        );

        return response.TypeID;
    }

    public async updateTicketType(token: string, ticketTypeId: number, name: string, validId: any): Promise<number> {
        const response = await this.httpService.patch<UpdateTicketTypeResponse>(
            this.TICKETTYPES_RESOURCE_URI + '/' + ticketTypeId, new UpdateTicketTypeRequest(name, validId)
        );

        return response.TypeID;
    }

    public deleteTicketType(token: string, ticketTypeId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
