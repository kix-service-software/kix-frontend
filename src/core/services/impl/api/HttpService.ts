import { HttpError } from '../../../api';
import { IServerConfiguration } from '../../../common';

import fs = require('fs');
import { ConfigurationService } from '../ConfigurationService';
import { LoggingService } from '../LoggingService';
import { ProfilingService } from '../ProfilingService';

export class HttpService {

    private static INSTANCE: HttpService;

    public static getInstance(): HttpService {
        if (!HttpService.INSTANCE) {
            HttpService.INSTANCE = new HttpService();
        }
        return HttpService.INSTANCE;
    }

    private request: any;
    private apiURL: string;
    private backendCertificate: any;

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();
        this.apiURL = serverConfig.BACKEND_API_URL;
        this.request = require('request-promise');

        const certPath = ConfigurationService.getInstance().certDirectory + '/backend.pem';
        this.backendCertificate = fs.readFileSync(certPath);
    }

    public initCache(): Promise<void> {
        return;
    }

    private async executeRequest<T>(resource: string, token: string, options: any): Promise<T> {
        // extend options
        options.uri = this.buildRequestUrl(resource);
        options.headers = {
            Authorization: 'Token ' + token
        };
        options.json = true;
        options.ca = this.backendCertificate;

        let parameter = '';
        if (options.method === 'GET') {
            parameter = ' ' + JSON.stringify(options.qs);
        } else if (options.method === 'POST' || options.method === 'PATCH') {
            parameter = ' ' + JSON.stringify(options.body);
            parameter = parameter.replace('\\n', '\n');
        }

        // start profiling
        const profileTaskId = ProfilingService.getInstance().start(
            'HttpService',
            options.method + ' ' + resource + parameter,
            {
                a: options,
                b: parameter
            });

        const response = await this.request(options)
            .catch((error) => {
                LoggingService.getInstance().error('Error during HTTP ' + options.method + ' request.', error);
                return Promise.reject(this.createHttpError(error));
            });

        // stop profiling
        ProfilingService.getInstance().stop(profileTaskId, response);

        return response;
    }

    public async get<T>(resource: string, queryParameters, token?: any): Promise<T> {
        const options = {
            method: 'GET',
            qs: queryParameters
        };

        return this.executeRequest<T>(resource, token, options);
    }

    public async post<T>(resource: string, content: any, token?: any): Promise<T> {
        const options = {
            method: 'POST',
            body: content
        };

        return this.executeRequest<T>(resource, token, options);
    }

    public async put<T>(resource: string, content: any, token?: any): Promise<T> {
        const options = {
            method: 'PUT',
            body: content
        };

        return this.executeRequest<T>(resource, token, options);
    }

    public async patch<T>(resource: string, content: any, token?: any): Promise<T> {
        const options = {
            method: 'PATCH',
            body: content
        };

        return this.executeRequest<T>(resource, token, options);
    }

    public async delete<T>(resource: string, token?: any): Promise<T> {
        const options = {
            method: 'DELETE',
        };

        return this.executeRequest<T>(resource, token, options);
    }

    private buildRequestUrl(resource: string): string {
        return `${this.apiURL}/${resource}`;
    }

    private createHttpError(err: any): HttpError {
        LoggingService.getInstance().error(err.statusCode + " - " + err.message);
        return new HttpError(err.statusCode, err.response);
    }

}
