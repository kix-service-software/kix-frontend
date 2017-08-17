export interface IHttpService {

    get<T>(resource: string, queryParameters?: any): Promise<T>;

    post(resource: string, content: any): Promise<any>;

    put(resource: string, content: any): Promise<string>;

    patch(resource: string, content: any): Promise<string>;

    delete(resource: string): Promise<any>;
}
