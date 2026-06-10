/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../server/model/Error';
import { RequestMethod } from '../../../server/model/rest/RequestMethod';
import { IdService } from '../model/IdService';
import { ClientStorageService } from '../modules/base-components/webapp/core/ClientStorageService';
import { NotificationWorker } from '../modules/notification/webapp/core/NotificationWorker';
import { APIHeader } from '../server/api/APIHeader';

export class APIClient {

    public static async executeRequest(
        method: RequestMethod, relativeUrl: string,
        body?: any, query?: any, objectIds?: Array<string | number>,
        controller?: AbortController, handleError: boolean = true
    ): Promise<Response> {

        ClientStorageService.initClientRequestId();

        const options: RequestInit = { method };
        this.prepareBody(options, body);

        const jsonContent = options.body && !(options.body instanceof FormData);
        options.headers = this.prepareHeaders(jsonContent);

        if (controller) {
            options.signal = controller.signal;
        }

        const url = this.prepareUrl(relativeUrl, objectIds, query);

        const response = await fetch(url, options).catch((e) => {
            if (e.name !== 'AbortError') {
                const errorMessage = `API Error - ${method} - ${relativeUrl}`;
                console.error(errorMessage);
            }
            throw e;
        });

        if (handleError && response.status >= 400) {
            if (response.status === 401) {
                window.location.replace('/auth');
                return;
            }

            let errorCode = response.status.toString();
            let errorMessage = response.statusText;
            try {
                const result = await response.json();
                errorCode = result?.Code || response.status;
                errorMessage = result?.Message || response.statusText;
            } catch {
                // nothing
            }
            console.error(`API Error - ${method} - ${relativeUrl} (${errorCode}: ${errorMessage})`);
            throw new Error(errorCode, errorMessage, response.status);
        }

        if ([RequestMethod.POST, RequestMethod.PATCH, RequestMethod.DELETE].some((m) => m === method)) {
            NotificationWorker.getInstance().sendMessage({ forceNotificationLoad: true });
        }

        return response;
    }

    private static prepareBody(options: RequestInit, body?: any): void {
        if (body) {
            if (body instanceof FormData) {
                options.body = body;
            } else {
                options.body = JSON.stringify(body);
            }
        }
    }

    private static prepareUrl(relativeUrl: string, objectIds: Array<string | number>, query: any): string {
        let url = this.getUrl(relativeUrl, objectIds);
        if (query) {
            url += `${this.prepareQueryString(query)}`;
        }
        return url;
    }

    /**
     * creates the url for an api request
     * @param url api specific route wiht leading /
     * @returns full qualified url
     */
    public static getUrl(url: string, objectIds: Array<string | number> = [], params?: any): string {
        const apiPrefix = '/api/v1';
        if (url.indexOf('/') !== 0) {
            url = '/' + url;
        }
        const apiUrl = `${ClientStorageService.getApplicationUrl()}${apiPrefix}${url}`;

        const objectIdsString = this.prepareObjectIdsString(objectIds);
        const query = this.prepareQueryString(params);

        const requestUrl = `${apiUrl}${objectIdsString}${query}`;
        return requestUrl;
    }

    protected static prepareHeaders(json?: boolean, headers?: any): any {
        if (!headers) {
            headers = {};
        }

        if (json) {
            headers['Content-Type'] = 'application/json';
        }

        const organisationId = ClientStorageService.getOption('RelevantOrganisationID');
        if (organisationId) {
            headers[APIHeader.KIX_HEADER_RELEVANT_ORG_ID] = organisationId;
        }

        headers[APIHeader.KIX_APPLICATION] = ClientStorageService.application;
        headers[APIHeader.KIX_HEADER_BASE_ROUTE] = ClientStorageService.getBaseRoute();

        const requestId = IdService.generateDateBasedId();
        headers[APIHeader.KIX_HEADER_REQUEST_ID] = requestId;

        return headers;
    }

    protected static prepareObjectIdsString(objectIds: Array<string | number> = []): string {
        const objectIdsString = objectIds?.map((oid) => encodeURIComponent(oid)).join(',') || '';
        return objectIdsString ? '/' + objectIdsString : '';
    }

    protected static prepareQueryString(parameter: any): string {
        const query = [];

        if (parameter) {
            for (const param in parameter) {
                if (parameter[param] !== null && typeof parameter[param] !== 'undefined') {
                    query.push(`${param}=${encodeURIComponent(parameter[param])}`);
                }
            }
        }
        return query.length ? '?' + query.join('&') : '';
    }

}