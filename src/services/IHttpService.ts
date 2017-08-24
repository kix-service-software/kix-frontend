export interface IHttpService {

    get<T>(resource: string, queryParameters: any, token?: string): Promise<T>;

    post<T>(resource: string, content: any): Promise<T>;

    put<T>(resource: string, content: any): Promise<T>;

    patch<T>(resource: string, content: any): Promise<T>;

    delete<T>(resource: string): Promise<T>;
}
