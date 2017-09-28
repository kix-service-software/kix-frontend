import { injectable, inject } from 'inversify';
import {
    IHttpService,
    IValidObjectService,
    ValidObject,
    ValidObjectResponse,
    ValidObjectsResponse,
    SortOrder,
    Query
} from '@kix/core';

const RESOURCE_TICKET_STATES = "valid";

@injectable()
export class ValidObjectService implements IValidObjectService {

    private httpService: IHttpService;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getValidObjects(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<ValidObject[]> {
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

        const response = await this.httpService.get<ValidObjectsResponse>(
            RESOURCE_TICKET_STATES, query, token
        );

        return response.Valid;
    }

    public async getValidObject(token: string, ticketStateId: number, query?: any): Promise<ValidObject> {
        if (!query) {
            query = {};
        }

        const uri = this.buildUrl(RESOURCE_TICKET_STATES, ticketStateId);

        const response = await this.httpService.get<ValidObjectResponse>(
            uri, query, token
        );

        return response.Valid;
    }

    private buildUrl(...args): string {
        return args.join("/");
    }

}
