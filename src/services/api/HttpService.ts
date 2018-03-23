import { IHttpService, IConfigurationService, ILoggingService, IProfilingService } from '@kix/core/dist/services';

import { HttpError } from '@kix/core/dist/api';
import { IServerConfiguration } from '@kix/core/dist/common';

import { injectable, inject } from 'inversify';
import * as path from 'path';
import fs = require('fs');

@injectable()
export class HttpService implements IHttpService {

    private request: any;
    private apiURL: string;
    private backendCertificate: any;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("ILoggingService") protected loggingService: ILoggingService,
        @inject("IProfilingService") protected profilingService: IProfilingService
    ) {
        const serverConfig: IServerConfiguration = configurationService.getServerConfiguration();
        this.apiURL = serverConfig.BACKEND_API_URL;
        this.request = require('request-promise');
        this.loggingService = loggingService;
        this.backendCertificate = fs.readFileSync(path.join(__dirname, '../../../cert/backend.pem'));
    }

    private async executeRequest<T>(resource: string, token: string, options: any): Promise<T> {
        // extend options
        options.uri = this.buildRequestUrl(resource);
        options.headers = {
            Authorization: 'Token ' + token
        };
        options.json = true;
        options.ca = this.backendCertificate;

        const queryParameters = (options.method === 'GET') ? ' ' + JSON.stringify(options.qs) : '';

        // start profiling
        const profileTaskId = this.profilingService.start(
            'HttpService',
            options.method + ' ' + resource + queryParameters,
            {
                a: options,
                b: queryParameters
            });

        const response = await this.request(options)
            .catch((error) => {
                this.loggingService.error('Error during HTTP ' + options.method + ' request.', error);
                return Promise.reject(this.createHttpError(error));
            });

        // stop profiling
        this.profilingService.stop(profileTaskId, response);

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
        this.loggingService.error(err.statusCode + " - " + err.message);
        return new HttpError(err.statusCode, err.response);
    }

}
