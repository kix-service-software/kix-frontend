import { IHttpService, Query, SortOrder } from '@kix/core';
import { inject, injectable } from 'inversify';

/**
 * Generic abstract class for all ObjectServices.
 *
 * <T> is the type of object which is handled by the service.
 *
 * The class provides generic methods to make get, update, create and delete requests against the REST-API.
 */
@injectable()
export abstract class ObjectService<T> {

    protected httpService: IHttpService;

    /**
     * The base uri to reach the object in the REST-API. Have to be implemented by each service
     */
    protected abstract RESOURCE_URI: string;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    /**
     * Generates a GET request against the {@link RESOURCE_URI} to retrieve a collection of <T>
     *
     * @param token the user token for authentication
     * @param limit a limit for the result collection
     * @param order a {@link SortOrder} for the collection
     * @param changedAfter a date to filter collection
     * @param query specific query for the resource
     *
     * @return a Promise which resolves the response from the API
     */
    protected async getObjects<R>(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<R> {
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

        return await this.httpService.get<R>(this.RESOURCE_URI, query, token);
    }

    /**
     * Generates a GET request against the {@link RESOURCE_URI} to retrieve a object of <T>
     *
     * @param token the user token for authentication
     * @param objectId the id of the requested object
     * @param query specific query for the resource
     *
     * @return a Promise which resolves the response from the API
     */
    protected getObject<R>(token: string, objectId: number, query?: any): Promise<R> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        return this.getObjectByUri(token, uri, query);
    }

    /**
     * Generates a GET request against the given uri to retrieve a object of <T>
     *
     * @param token the user token for authentication
     * @param uri the specific REST-API uri
     * @param query specific query for the resource
     *
     * @return a Promise which resolves the response from the API
     */
    protected async getObjectByUri<R>(token: string, uri: string, query?: any): Promise<R> {
        if (!query) {
            query = {};
        }

        return await this.httpService.get<R>(uri, query, token);
    }

    /**
     * Generates a POST request against the given uri create a object of <T>
     *
     * @param token the user token for authentication
     * @param uri the specific REST-API uri
     * @param content the content of type <C> for the request
     *
     * @return a Promise which resolves the response from the API
     */
    protected async createObject<R, C>(token: string, uri: string, content: C): Promise<R> {
        return await this.httpService.post<R>(uri, content, token);
    }

    /**
     * Generates a PATCH request against the given uri update a object of <T>
     *
     * @param token the user token for authentication
     * @param uri the specific REST-API uri
     * @param content the content of type <C> for the request
     *
     * @return a Promise which resolves the response from the API
     */
    protected async updateObject<R, C>(token: string, uri: string, content: C): Promise<R> {
        return await this.httpService.patch<R>(uri, content);
    }

    /**
     * Generates a DELETE request against the given uri to delete a object of <T>
     *
     * @param token the user token for authentication
     * @param uri the specific REST-API uri
     *
     * @return a Promise of void
     */
    protected async deleteObject<R>(token: string, uri: string): Promise<R> {
        return await this.httpService.delete<R>(uri);
    }

    /**
     * Builds a uri string for the given parameters
     *
     * @param args the parameter for the uri
     */
    protected buildUri(...args): string {
        return args.join("/");
    }

}
