import { IConfigurationService, ILoggingService } from './';
import { injectable, inject } from 'inversify';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HttpError, IServerConfiguration } from './../model/';
import { IHttpService } from './IHttpService';

@injectable()
export class HttpService implements IHttpService {

    private axios: AxiosInstance;

    private apiURL: string;

    private loggingService: ILoggingService;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("ILoggingService") loggingService: ILoggingService
    ) {
        const serverConfig: IServerConfiguration = configurationService.getServerConfiguration();
        this.apiURL = serverConfig.BACKEND_API_URL;
        this.axios = require('axios');
        this.loggingService = loggingService;
    }

    public async get<T>(resource: string, queryParameters: any = {}): Promise<T> {
        const response = await this.axios.get(this.buildRequestUrl(resource), { params: queryParameters })
            .catch((error: AxiosError) => {
                throw this.createHttpError(error);
            });
        return response.data;
    }

    public async post<T>(resource: string, content: any): Promise<T> {
        const response = await this.axios.post(this.buildRequestUrl(resource), content)
            .catch((error: AxiosError) => {
                throw this.createHttpError(error);
            });
        return response.data;
    }

    public async put<T>(resource: string, content: any): Promise<T> {
        const response = await this.axios.put(this.buildRequestUrl(resource), content)
            .catch((error: AxiosError) => {
                throw this.createHttpError(error);
            });
        return response.data;
    }

    public async patch<T>(resource: string, content: any): Promise<T> {
        const response = await this.axios.patch(this.buildRequestUrl(resource), content)
            .catch((error: AxiosError) => {
                throw this.createHttpError(error);
            });
        return response.data;
    }

    public async delete<T>(resource: string): Promise<T> {
        const response = await this.axios.delete(this.buildRequestUrl(resource))
            .catch((error: AxiosError) => {
                throw this.createHttpError(error);
            });
        return response.data;
    }

    private buildRequestUrl(resource: string): string {
        return `${this.apiURL}/${resource}`;
    }

    private createHttpError(err: AxiosError): HttpError {
        if (err.response) {
            this.loggingService.error(err.message + ' - ' + err.response.status, err.response.data);
            return new HttpError(err.response.status, err.response.data, err);
        } else {
            this.loggingService.error(err.message);
            return new HttpError(500, err.message, err);
        }
    }

}
