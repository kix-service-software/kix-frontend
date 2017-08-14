export interface IHttpService {

    get(resource: string, queryParameters?: any): Promise<any>;

    post(resource: string, content: any): Promise<any>;

    put(resource: string, content: any): Promise<string>;

    patch(resource: string, content: any): Promise<string>;

    delete(resource: string): Promise<any>;
}
