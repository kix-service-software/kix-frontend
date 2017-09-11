import { IHttpService, IConfigurationService, ILoggingService } from './';
import { injectable, inject } from 'inversify';
import { HttpError, IServerConfiguration } from './../model/';
import * as path from 'path';
import fs = require('fs');

@injectable()
export class HttpService implements IHttpService {

    private request: any;
    private apiURL: string;
    private loggingService: ILoggingService;
    private backendCertificate: any;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("ILoggingService") loggingService: ILoggingService
    ) {
        const serverConfig: IServerConfiguration = configurationService.getServerConfiguration();
        this.apiURL = serverConfig.BACKEND_API_URL;
        this.request = require('request-promise');
        this.loggingService = loggingService;
        this.backendCertificate = fs.readFileSync(path.join(__dirname, '../../cert/backend.pem'));
    }

    public async get<T>(resource: string, queryParameters, token?: any): Promise<T> {
        const options = {
            method: 'GET',
            uri: this.buildRequestUrl(resource),
            qs: queryParameters,
            headers: {
                Authorization: 'Token ' + token
            },
            json: true,
            ca: this.backendCertificate
        };

        const response = await this.request(options)
            .catch((error) => {
                return Promise.reject(this.createHttpError(error));
            });

        return response;
    }

    public async post<T>(resource: string, content: any): Promise<T> {
        const options = {
            method: 'POST',
            uri: this.buildRequestUrl(resource),
            body: content,
            json: true,
            ca: this.backendCertificate
        };

        const response = await this.request(options)
            .catch((error) => {
                return Promise.reject(this.createHttpError(error));
            });

        return response;
    }

    public async put<T>(resource: string, content: any): Promise<T> {
        const options = {
            method: 'PUT',
            uri: this.buildRequestUrl(resource),
            body: content,
            json: true,
            ca: this.backendCertificate
        };

        const response = await this.request(options)
            .catch((error) => {
                return Promise.reject(this.createHttpError(error));
            });
        return response;
    }

    public async patch<T>(resource: string, content: any): Promise<T> {
        const options = {
            method: 'PATCH',
            uri: this.buildRequestUrl(resource),
            body: content,
            json: true,
            ca: this.backendCertificate
        };

        const response = await this.request(options)
            .catch((error) => {
                return Promise.reject(this.createHttpError(error));
            });
        return response;
    }

    public async delete<T>(resource: string): Promise<T> {
        const options = {
            method: 'DELETE',
            uri: this.buildRequestUrl(resource),
            json: true,
            ca: this.backendCertificate
        };

        const response = await this.request.delete(options)
            .catch((error) => {
                return Promise.reject(this.createHttpError(error));
            });
        return response;
    }

    private buildRequestUrl(resource: string): string {
        return `${this.apiURL}/${resource}`;
    }

    private createHttpError(err: any): HttpError {
        this.loggingService.error(err.statusCode + " - " + err.message);
        return new HttpError(err.statusCode, err.response);
    }

}
