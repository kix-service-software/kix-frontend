export interface IHTTPService {

    get(resource: string, parameters: any): Promise<any>;

}
