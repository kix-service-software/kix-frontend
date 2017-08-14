import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HttpError } from './../model/http/HttpError';
import { IHttpService } from './IHttpService';
import { IServerConfiguration } from './../model/configuration/IServerConfiguration';

export class HttpService implements IHttpService {

    private axios: AxiosInstance;

    private apiURL: string;

    public constructor() {
        const serverConfig: IServerConfiguration = require('../../server.config.json');
        this.apiURL = serverConfig.BACKEND_API_URL;
        this.axios = require('axios');
    }

    public async get(resource: string, queryParameters: any = {}): Promise<any> {
        return await this.axios.get(`${this.apiURL}/${resource}`, { params: queryParameters })
            .then((response: AxiosResponse) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    public async post(resource: string, content: any): Promise<string> {
        return await this.axios.post(`${this.apiURL}/${resource}`, content)
            .then((response) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    public async put(resource: string, content: any): Promise<string> {
        return await this.axios.put(`${this.apiURL}/${resource}`, content)
            .then((response) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    public async delete(resource: string): Promise<any> {
        return await this.axios.delete(`${this.apiURL}/${resource}`)
            .then((response: AxiosResponse) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    private createHttpError(err: AxiosError): HttpError {
        return new HttpError(err.response.status, err.response.data);
    }

}
