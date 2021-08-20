/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import fs = require('fs');

import { AuthenticationService } from './AuthenticationService';
import { IServerConfiguration } from '../../../../server/model/IServerConfiguration';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { CacheService } from './cache';
import { OptionsResponse } from '../../../../server/model/rest/OptionsResponse';
import { ProfilingService } from '../../../../server/services/ProfilingService';
import { LoggingService } from '../../../../server/services/LoggingService';
import { Error } from '../../../../server/model/Error';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { User } from '../../modules/user/model/User';
import { PermissionError } from '../../modules/user/model/PermissionError';
import { PermissionType } from '../../modules/user/model/PermissionType';


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
    private requestPromises: Map<string, Promise<any>> = new Map();

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();
        this.apiURL = serverConfig?.BACKEND_API_URL;
        this.request = require('request-promise');

        const certPath = ConfigurationService.getInstance().certDirectory + '/backend.pem';
        try {
            this.backendCertificate = fs.readFileSync(certPath);
        } catch (error) {
            LoggingService.getInstance().error(error);
        }

        if (serverConfig?.LOG_REQUEST_QUEUES_INTERVAL) {
            setInterval(
                () => LoggingService.getInstance().debug(`HTTP Request Queue Length: ${this.requestPromises.size}`),
                serverConfig?.LOG_REQUEST_QUEUES_INTERVAL
            );
        }
    }

    public async get<T>(
        resource: string, queryParameters: any, token: any, clientRequestId: string,
        cacheKeyPrefix: string = '', useCache: boolean = true
    ): Promise<T> {
        const options = {
            method: RequestMethod.GET,
            qs: queryParameters
        };

        let cacheKey: string;
        if (useCache) {
            cacheKey = await this.buildCacheKey(resource, queryParameters, token);
            const cachedObject = await CacheService.getInstance().get(cacheKey, cacheKeyPrefix);
            if (cachedObject) {
                return cachedObject;
            }
        }

        const requestKey = await this.buildCacheKey(resource, queryParameters, token, true);

        if (this.requestPromises.has(requestKey)) {
            return this.requestPromises.get(requestKey);
        }

        const requestPromise = this.executeRequest<T>(resource, token, clientRequestId, options);

        this.requestPromises.set(requestKey, requestPromise);

        requestPromise
            .then((response) => {
                if (useCache) {
                    CacheService.getInstance().set(cacheKey, response, cacheKeyPrefix);
                }
                this.requestPromises.delete(requestKey);
            })
            .catch(() => this.requestPromises.delete(requestKey));

        return requestPromise;
    }

    public async post<T>(
        resource: string, content: any, token: any, clientRequestId: string, cacheKeyPrefix: string = '',
        logError: boolean = true
    ): Promise<T> {
        const options = {
            method: RequestMethod.POST,
            body: content
        };

        const response = await this.executeRequest<T>(resource, token, clientRequestId, options, undefined, logError);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix).catch(() => null);
        return response;
    }

    public async patch<T>(
        resource: string, content: any, token: any, clientRequestId: string, cacheKeyPrefix: string = ''
    ): Promise<T> {
        const options = {
            method: RequestMethod.PATCH,
            body: content
        };

        const response = await this.executeRequest<T>(resource, token, clientRequestId, options);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return response;
    }

    public async delete<T>(
        resources: string[], token: any, clientRequestId: string, cacheKeyPrefix: string = '',
        logError: boolean = true
    ): Promise<Error[]> {
        const options = {
            method: RequestMethod.DELETE,
        };

        const errors = [];
        const executePromises = [];
        resources.forEach((resource) => executePromises.push(
            this.executeRequest<T>(resource, token, clientRequestId, options, null, logError)
                .catch((error: Error) => errors.push(error))
        ));

        await Promise.all(executePromises);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return errors;
    }

    public async options(token: string, resource: string, content: any): Promise<OptionsResponse> {
        const options = {
            method: RequestMethod.OPTIONS,
            body: content
        };

        const cacheKey = token + resource;
        let response = await CacheService.getInstance().get(cacheKey, RequestMethod.OPTIONS);
        if (!response) {
            response = await this.executeRequest<Response>(resource, token, null, options, true);
            await CacheService.getInstance().set(cacheKey, response, RequestMethod.OPTIONS);
        }

        return new OptionsResponse(response);
    }

    private executeRequest<T>(
        resource: string, token: string, clientRequestId: string, options: any, fullResponse: boolean = false,
        logError: boolean = true
    ): Promise<T> {
        const backendToken = AuthenticationService.getInstance().getBackendToken(token);

        // extend options
        options.uri = this.buildRequestUrl(resource);
        options.headers = {
            'Authorization': 'Token ' + backendToken,
            'KIX-Request-ID': clientRequestId
        };
        options.json = true;
        options.ca = this.backendCertificate;

        if (fullResponse) {
            options.resolveWithFullResponse = true;
        }

        let parameter = '';
        if (options.method === 'GET') {
            parameter = ' ' + JSON.stringify(options.qs);
        } else if (options.method === 'POST' || options.method === 'PATCH') {
            if (typeof options.body === 'object') {
                const body = this.getPreparedBody(options.body);
                parameter = ' ' + JSON.stringify(body);
            } else {
                parameter = ' ' + JSON.stringify(options.body);
            }
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

        return new Promise((resolve, reject) => {
            this.request(options)
                .then((response) => {
                    resolve(response);
                    ProfilingService.getInstance().stop(profileTaskId, response);
                }).catch((error) => {
                    if (logError) {
                        LoggingService.getInstance().error(
                            `Error during HTTP (${resource}) ${options.method} request.`, error
                        );
                    }
                    ProfilingService.getInstance().stop(profileTaskId, 'Error');
                    if (error.statusCode === 403) {
                        reject(new PermissionError(this.createError(error), resource, options.method));
                    } else {
                        reject(this.createError(error));
                    }
                });
        });
    }

    private getPreparedBody(body: {}): {} {
        const newBody = {};
        for (const param in body) {
            if (param.match(/password/i) || param.match(/^UserPw$/)) {
                newBody[param] = '*****';
            } else if (typeof body[param] === 'object') {
                newBody[param] = this.getPreparedBody(body[param]);
            } else {
                newBody[param] = body[param];
            }
        }
        return newBody;
    }

    private buildRequestUrl(resource: string): string {
        let encodedResource = encodeURI(resource);
        encodedResource = encodedResource.replace(/###/g, '%23%23%23');
        return `${this.apiURL}/${encodedResource}`;
    }

    private createError(error: any): Error {
        if (error.statusCode === 500) {
            LoggingService.getInstance().error(`(${error.statusCode}) ${error.message}`);
            return new Error(error.statusCode, error.message, error.statusCode);
        } else {
            LoggingService.getInstance().error(`(${error.statusCode}) ${error.error.Code}  ${error.error.Message}`);
            return new Error(error.error.Code, error.error.Message, error.statusCode);
        }
    }

    private async buildCacheKey(resource: string, query: any, token: string, useToken?: boolean): Promise<string> {
        let cacheId = token;
        if (!useToken) {
            const user = await this.getUserByToken(token);
            cacheId = user.UserID.toString();
        }
        const ordered = {};

        if (query) {
            Object.keys(query).sort().forEach((k) => {
                ordered[k] = query[k];
            });
        }

        const queryString = JSON.stringify(ordered);
        const key = `${cacheId};${resource};${queryString}`;

        return key;
    }

    public async getUserByToken(token: string): Promise<User> {
        const backendToken = AuthenticationService.getInstance().getBackendToken(token);

        const user = await CacheService.getInstance().get(backendToken, KIXObjectType.CURRENT_USER);
        if (user) {
            return user;
        }
        const options: any = {
            method: RequestMethod.GET,
            qs: {
                'include': 'Tickets,Preferences,RoleIDs,Contact',
                'Tickets.StateType': 'Open'
            }
        };

        const uri = 'session/user';
        options.uri = this.buildRequestUrl(uri);
        options.headers = {
            'Authorization': 'Token ' + backendToken,
            'KIX-Request-ID': ''
        };
        options.json = true;
        options.ca = this.backendCertificate;

        // start profiling
        const profileTaskId = ProfilingService.getInstance().start(
            'HttpService',
            options.method + ' ' + uri,
            {
                a: options
            });

        return new Promise<User>((resolve, reject) => {
            this.request(options)
                .then(async (response) => {
                    await CacheService.getInstance().set(backendToken, response['User'], KIXObjectType.CURRENT_USER);
                    resolve(response['User']);
                    ProfilingService.getInstance().stop(profileTaskId, response);
                }).catch((error) => {
                    LoggingService.getInstance().error(
                        `Error during HTTP (${uri}) ${options.method} request.`, error
                    );
                    ProfilingService.getInstance().stop(profileTaskId, 'Error');
                    if (error.statusCode === 403) {
                        reject(new PermissionError(this.createError(error), uri, options.method));
                    } else {
                        reject(this.createError(error));
                    }
                });
        });
    }

}
