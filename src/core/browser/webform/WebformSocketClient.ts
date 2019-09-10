/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketRequest, SocketEvent, WebformEvent, LoadWebformsResponse, CreateObjectResponse } from '../../model';

import { SocketClient } from '../SocketClient';
import { ClientStorageService } from '../ClientStorageService';
import { IdService } from '../IdService';
import { SocketErrorResponse } from '../../common';
import { Webform } from '../../model/webform';
import { WebformBrowserFactory } from './WebformBrowserFactory';
import { SaveWebformRequest } from '../../model/socket/application/SaveWebformRequest';

export class WebformSocketClient extends SocketClient {

    public static getInstance(): WebformSocketClient {
        if (!WebformSocketClient.INSTANCE) {
            WebformSocketClient.INSTANCE = new WebformSocketClient();
        }

        return WebformSocketClient.INSTANCE;
    }

    private static INSTANCE: WebformSocketClient = null;

    public constructor() {
        super();
        this.socket = this.createSocket('webform', true);
    }

    public loadWebforms(): Promise<Webform[]> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request: ISocketRequest = {
                token,
                clientRequestId: ClientStorageService.getClientRequestId(),
                requestId
            };

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + WebformEvent.LOAD_WEBFORMS);
            }, 30000);

            this.socket.on(WebformEvent.LOAD_WEBFORMS_FINISHED, async (result: LoadWebformsResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    const webforms = [];
                    for (const object of result.webforms) {
                        const factoryObject = await WebformBrowserFactory.getInstance().create(object);
                        webforms.push(factoryObject);
                    }
                    resolve(webforms);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(WebformEvent.LOAD_WEBFORMS, request);
        });
    }

    public createUpdateWebform(webform: Webform, formId?: number): Promise<number> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new SaveWebformRequest(
                token, requestId, ClientStorageService.getClientRequestId(), webform, formId
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + WebformEvent.SAVE_WEBFORM);
            }, 30000);

            this.socket.on(WebformEvent.WEBFORM_SAVED, async (result: CreateObjectResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.result);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(WebformEvent.SAVE_WEBFORM, request);
        });
    }

}
