export interface IHttpService {

    get(resource: string, queryParameters: any): Promise<any>;

}
