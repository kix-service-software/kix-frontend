import { injectable, inject } from 'inversify';
import {
    IHttpService,
    IValidService,
    Valid,
    ValidResponse,
    ValidsResponse,
    SortOrder,
    Query
} from '@kix/core';

const RESOURCE_TICKET_STATES = "valid";

@injectable()
export class ValidService implements IValidService {

    private httpService: IHttpService;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getValids(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Valid[]> {
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

        const response = await this.httpService.get<ValidsResponse>(
            RESOURCE_TICKET_STATES, query, token
        );

        return response.Valid;
    }

    public async getValid(token: string, ticketStateId: number, query?: any): Promise<Valid> {
        if (!query) {
            query = {};
        }

        const uri = this.buildUrl(RESOURCE_TICKET_STATES, ticketStateId);

        const response = await this.httpService.get<ValidResponse>(
            uri, query, token
        );

        return response.Valid;
    }

    private buildUrl(...args): string {
        return args.join("/");
    }

}
