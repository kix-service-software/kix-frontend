/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import fs from 'fs';

import { AuthenticationService } from '../../../../server/services/AuthenticationService';
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
import { AxiosAdapter, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { SocketAuthenticationError } from '../../../../server/model/SocketAuthenticationError';
import { RequestCounter } from '../../../../server/services/RequestCounter';
import { HTTPResponse } from './HTTPResponse';
import { Session } from '../../../../server/model/Session';
import { IncomingHttpHeaders } from 'http';

export class HttpService {

    private static INSTANCE: HttpService;

    public static getInstance(): HttpService {
        if (!HttpService.INSTANCE) {
            HttpService.INSTANCE = new HttpService();
        }
        return HttpService.INSTANCE;
    }

    private axios: AxiosAdapter;
    private apiURL: string;
    private isClusterEnabled: boolean = false;
    private backendCertificate: any;
    private requestPromises: Map<string, Promise<any>> = new Map();

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();
        this.apiURL = serverConfig?.BACKEND_API_URL;
        this.isClusterEnabled = serverConfig.CLUSTER_ENABLED;
        this.axios = require('axios');

        const certPath = ConfigurationService.getInstance().certDirectory + '/backend.pem';
        try {
            this.backendCertificate = fs.readFileSync(certPath);
        } catch (error) {
            LoggingService.getInstance().error(error);
        }

        if (serverConfig?.LOG_REQUEST_QUEUES_INTERVAL) {
            setInterval(
                () => LoggingService.getInstance().debug(`HTTP Request Queue Length: ${RequestCounter.getInstance().getPendingHTTPRequestCount()}`),
                serverConfig?.LOG_REQUEST_QUEUES_INTERVAL
            );
        }
    }

    public async get<T>(
        resource: string, queryParameters: any, token: string, clientRequestId: string,
        cacheKeyPrefix: string = '', useCache: boolean = true
    ): Promise<HTTPResponse<T>> {
        const options = {
            method: RequestMethod.GET,
            params: queryParameters
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


        let semaphor;
        const semaphorKey = cacheKey ? `SEMAPHOR-${cacheKey}` : requestKey;
        if (this.isClusterEnabled && useCache) {
            semaphor = await CacheService.getInstance().get(semaphorKey, semaphorKey);

            if (semaphor) {
                LoggingService.getInstance().debug('\tSEMAPHOR\tStart\t' + semaphorKey + '\tWAITFOR');
                const cachedObject = await CacheService.getInstance().waitFor(cacheKey, cacheKeyPrefix);
                LoggingService.getInstance().debug('\tSEMAPHOR\tStop\t' + semaphorKey + '\tWAITFOR');
                if (cachedObject) {
                    return cachedObject;
                }

                semaphor = null;
            }
        }

        const requestPromise = this.executeRequest<HTTPResponse>(resource, token, clientRequestId, options);
        this.requestPromises.set(requestKey, requestPromise);

        if (this.isClusterEnabled && useCache) {
            LoggingService.getInstance().debug('\tSEMAPHOR\t' + semaphorKey + '\tSET');
            await CacheService.getInstance().set(semaphorKey, 1, semaphorKey);
        }

        RequestCounter.getInstance().setPendingHTTPRequestCount(this.requestPromises.size, true);

        const response = await requestPromise.catch((error) => {
            this.requestPromises.delete(requestKey);
            RequestCounter.getInstance().setPendingHTTPRequestCount(this.requestPromises.size);

            if (this.isClusterEnabled && useCache) {
                LoggingService.getInstance().debug('\tSEMAPHOR\t' + semaphorKey + '\tDELETE');
                CacheService.getInstance().deleteKeys(semaphorKey);
            }

            throw error;
        });

        this.requestPromises.delete(requestKey);

        RequestCounter.getInstance().setPendingHTTPRequestCount(this.requestPromises.size);

        if (useCache) {
            if (this.isClusterEnabled) {
                LoggingService.getInstance().debug('\tSEMAPHOR\t' + semaphorKey + '\tDELETE');
                await CacheService.getInstance().deleteKeys(semaphorKey);
            }

            CacheService.getInstance().set(cacheKey, response, cacheKeyPrefix);
        }

        return response;
    }

    public async post<T>(
        resource: string, content: any, token: string, clientRequestId: string, cacheKeyPrefix: string = '',
        logError: boolean = true, relevantOrganisationId?: number, headers?: IncomingHttpHeaders
    ): Promise<T> {
        const options: AxiosRequestConfig = {
            method: RequestMethod.POST,
            data: content,
            params: { RelevantOrganisationID: relevantOrganisationId }
        };


        const response = await this.executeRequest(resource, token, clientRequestId, options, logError, headers);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix).catch(() => null);
        return response?.data;
    }

    public async patch<T>(
        resource: string, content: any, token: string, clientRequestId: string, cacheKeyPrefix: string = '',
        relevantOrganisationId: number
    ): Promise<T> {
        const options: AxiosRequestConfig = {
            method: RequestMethod.PATCH,
            data: content,
            params: { RelevantOrganisationID: relevantOrganisationId }
        };

        const response = await this.executeRequest(resource, token, clientRequestId, options);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return response?.data;
    }

    public async delete<T>(
        resources: string[], token: string, clientRequestId: string, cacheKeyPrefix: string = '',
        logError: boolean = true
    ): Promise<Error[]> {
        const options: AxiosRequestConfig = {
            method: RequestMethod.DELETE,
        };

        const errors = [];
        const executePromises = [];
        resources.forEach((resource) => executePromises.push(
            this.executeRequest(resource, token, clientRequestId, options, logError)
                .catch((error: Error) => errors.push(error))
        ));

        await Promise.all(executePromises);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return errors;
    }

    public async options(
        token: string, resource: string, content: any, clientRequestId: string, collection: boolean
    ): Promise<OptionsResponse> {
        const options: AxiosRequestConfig = {
            method: RequestMethod.OPTIONS,
            data: content
        };

        const user = await this.getUserByToken(token);
        const session = await this.getUserSession(token);
        const cacheId = user.RoleIDs?.sort().join(';') + `${session?.UserType}`;

        const cacheKey = cacheId + resource;
        const cacheType = collection === null || typeof collection === 'undefined' || collection
            ? 'OPTION_COLLECTION'
            : RequestMethod.OPTIONS;

        let headers = await CacheService.getInstance().get(cacheKey, cacheType);
        if (!headers) {
            if (!this.requestPromises.has(cacheKey)) {
                this.requestPromises.set(
                    cacheKey,
                    this.executeRequest(
                        resource, token, clientRequestId, options, true
                    )
                );
            }

            const request = this.requestPromises.get(cacheKey);
            const response = await request.catch((e) => {
                this.requestPromises.delete(cacheKey);
                throw e;
            });

            headers = response.headers;
            await CacheService.getInstance().set(cacheKey, headers, cacheType);
            this.requestPromises.delete(cacheKey);
        }

        return new OptionsResponse(headers);
    }

    private async executeRequest<T = AxiosResponse>(
        resource: string, token: string, clientRequestId: string, options: AxiosRequestConfig,
        logError: boolean = true, headers?: IncomingHttpHeaders
    ): Promise<T> {
        const backendToken = AuthenticationService.getInstance().getBackendToken(token);

        if (token && !backendToken) {
            throw new SocketAuthenticationError('Invalid Token!');
        }

        // extend options
        options.baseURL = this.apiURL;
        options.url = this.buildRequestUrl(resource);

        options.headers = headers || {};
        options.headers['Authorization'] = 'Token ' + backendToken;
        options.headers['KIX-Request-ID'] = clientRequestId ? clientRequestId : '';

        options.maxBodyLength = Infinity;
        options.maxContentLength = Infinity;

        let parameter = '';
        if (options.method === 'GET') {
            parameter = ' ' + JSON.stringify(options.params);
        } else if (options.method === 'POST' || options.method === 'PATCH') {
            if (typeof options.data === 'object') {
                const body = this.getPreparedBody(options.data);
                parameter = ' ' + JSON.stringify(body);
            } else {
                parameter = ' ' + JSON.stringify(options.data);
            }
            parameter = parameter.replace('\\n', '\n');
        }

        // start profiling
        const profileTaskId = ProfilingService.getInstance().start(
            'HttpService',
            options.method + '\t' + resource + '\t' + parameter,
            {
                requestId: clientRequestId,
                data: [options, parameter]
            });

        let response: AxiosResponse | HTTPResponse = await this.axios(options).catch((error: AxiosError) => {
            if (logError) {
                LoggingService.getInstance().error(
                    `Error during HTTP (${resource}) ${options.method} request.`, error
                );
            }
            ProfilingService.getInstance().stop(profileTaskId, { data: ['Error'] });
            if (error?.response?.status === 403) {
                throw new PermissionError(this.createError(error), resource, options.method);
            } else if (error?.response?.status === 401) {
                throw new SocketAuthenticationError('Invalid Token!');
            } else {
                throw this.createError(error);
            }
        });

        ProfilingService.getInstance().stop(profileTaskId, { data: [response.data] });

        if (options.method === 'GET') {
            const countHeaders: any = {};
            if (response.headers) {
                for (const h in response.headers) {
                    if (h.startsWith('x-total-count-')) {
                        const object = h.toLocaleLowerCase().replace('x-total-count-', '');
                        countHeaders[object] = Number(response.headers[h]) || 0;
                    }
                }
            }

            response = new HTTPResponse(response?.data, countHeaders);
        }

        return response as any;
    }

    private getPreparedBody(body: any): any {
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

    private createError(error: AxiosError): Error {
        const status = error.response?.status;
        if (status === 500) {
            LoggingService.getInstance().error(`(${status}) ${error.response?.statusText}`);
            return new Error(error.response.status?.toString(), error.response?.statusText, status);
        } else {
            const backendError = new BackendHTTPError(error);
            LoggingService.getInstance().error(
                `(${status}) ${backendError.error.Code} ${backendError.error.Message}`
            );
            return new Error(backendError.error.Code?.toString(), backendError.error.Message, status);
        }
    }

    private async buildCacheKey(resource: string, query: any, token: string, useToken?: boolean): Promise<string> {
        let cacheId = token;
        if (!useToken) {
            const user = await this.getUserByToken(token);
            cacheId = user.RoleIDs?.sort().join(';');
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

    public async getUserByToken(token: string, withStats?: boolean): Promise<User> {
        const backendToken = AuthenticationService.getInstance().getBackendToken(token);
        const userId = AuthenticationService.getInstance().decodeToken(backendToken)?.UserID;

        const cacheType = withStats
            ? `${KIXObjectType.CURRENT_USER}_STATS_${userId}`
            : `${KIXObjectType.CURRENT_USER}_${userId}`;

        if (userId) {
            const user = await CacheService.getInstance().get(backendToken, cacheType);
            if (user) {
                return user;
            }
        }

        const requestKey = `${KIXObjectType.CURRENT_USER}-${token}`;
        if (this.requestPromises.has(requestKey)) {
            return this.requestPromises.get(requestKey);
        }

        const requestPromise = new Promise<User>(async (resolve, reject) => {
            let params = {};

            if (withStats) {
                params = {
                    'include': 'Tickets',
                    'Tickets.StateType': 'Open'
                };
            } else {
                params = {
                    'include': 'Preferences,RoleIDs,Contact,DynamicFields'
                };
            }

            const options: AxiosRequestConfig = { method: RequestMethod.GET, params };

            const uri = 'session/user';
            options.url = this.buildRequestUrl(uri);
            options.headers = {
                'Authorization': 'Token ' + backendToken,
                'KIX-Request-ID': ''
            };

            // start profiling
            const profileTaskId = ProfilingService.getInstance().start(
                'HttpService', options.method + '\t' + uri + '\t' + JSON.stringify(params), { data: [options] }
            );

            const response = await this.axios(options)
                .catch((error: AxiosError) => {
                    LoggingService.getInstance().error(
                        `Error during HTTP (${uri}) ${options.method} request.`, error
                    );
                    ProfilingService.getInstance().stop(profileTaskId, { data: ['Error'] });
                    if (error.response?.status === 403) {
                        throw new PermissionError(this.createError(error), uri, options.method);
                    } else {
                        throw this.createError(error);
                    }
                });

            await CacheService.getInstance().set(backendToken, response.data['User'], cacheType);
            ProfilingService.getInstance().stop(profileTaskId, { data: [response.data] });
            this.requestPromises.delete(requestKey);
            resolve(response.data['User']);
        });

        this.requestPromises.set(requestKey, requestPromise);

        const loadedUser = await requestPromise.catch(() => {
            this.requestPromises.delete(requestKey);
            return null;
        });
        return loadedUser;
    }

    public async getUserSession(token: string): Promise<Session> {
        const backendToken = AuthenticationService.getInstance().getBackendToken(token);

        const cacheType = `${KIXObjectType.USER_SESSION}_${token}`;

        const session = await CacheService.getInstance().get(backendToken, cacheType);
        if (session) {
            return session;
        }

        const requestKey = `${KIXObjectType.USER_SESSION}-${token}`;
        if (this.requestPromises.has(requestKey)) {
            return this.requestPromises.get(requestKey);
        }

        const requestPromise = new Promise<User>(async (resolve, reject) => {
            const options: AxiosRequestConfig = { method: RequestMethod.GET };

            const uri = 'session';
            options.url = this.buildRequestUrl(uri);
            options.headers = {
                'Authorization': 'Token ' + backendToken,
                'KIX-Request-ID': ''
            };

            // start profiling
            const profileTaskId = ProfilingService.getInstance().start(
                'HttpService', options.method + '\t' + uri + '\t', { data: [options] }
            );

            const response = await this.axios(options)
                .catch((error: AxiosError) => {
                    LoggingService.getInstance().error(
                        `Error during HTTP (${uri}) ${options.method} request.`, error
                    );
                    ProfilingService.getInstance().stop(profileTaskId, { data: ['Error'] });
                    if (error.response?.status === 403) {
                        throw new PermissionError(this.createError(error), uri, options.method);
                    } else {
                        throw this.createError(error);
                    }
                });

            await CacheService.getInstance().set(backendToken, response.data['Session'], cacheType);
            ProfilingService.getInstance().stop(profileTaskId, { data: [response.data] });
            this.requestPromises.delete(requestKey);
            resolve(response.data['Session']);
        });

        this.requestPromises.set(requestKey, requestPromise);

        const loadedSession = await requestPromise.catch(() => {
            this.requestPromises.delete(requestKey);
            return null;
        });
        return loadedSession;
    }

    public getPendingRequestCount(): number {
        return this.requestPromises.size;
    }
}

class BackendHTTPError {

    public status: number;

    public error: {
        Code: number,
        Message: string
    };

    public constructor(error: AxiosError) {
        const data = error?.response?.data;
        this.error = { Code: data?.Code, Message: data?.Message };
        this.status = error?.response?.status;
    }

}
