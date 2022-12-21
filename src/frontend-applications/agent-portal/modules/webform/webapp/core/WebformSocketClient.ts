/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../../../../modules/base-components/webapp/core/SocketClient';
import { Webform } from '../../model/Webform';
import { ClientStorageService } from '../../../../modules/base-components/webapp/core/ClientStorageService';
import { IdService } from '../../../../model/IdService';
import { ISocketRequest } from '../../../../modules/base-components/webapp/core/ISocketRequest';
import { WebformEvent } from '../../model/WebformEvent';
import { LoadWebformsResponse } from '../../model/LoadWebformsResponse';
import { SocketEvent } from '../../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../../modules/base-components/webapp/core/SocketErrorResponse';
import { SaveWebformRequest } from '../../model/SaveWebformRequest';
import { CreateObjectResponse } from '../../../../modules/base-components/webapp/core/CreateObjectResponse';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';

export class WebformSocketClient extends SocketClient {

    public static getInstance(): WebformSocketClient {
        if (!WebformSocketClient.INSTANCE) {
            WebformSocketClient.INSTANCE = new WebformSocketClient();
        }

        return WebformSocketClient.INSTANCE;
    }

    private static INSTANCE: WebformSocketClient = null;

    public constructor() {
        super('webform');
    }

    public async loadWebforms(): Promise<Webform[]> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<Webform[]>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const request: ISocketRequest = {
                clientRequestId: ClientStorageService.getClientRequestId(),
                requestId
            };

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + WebformEvent.LOAD_WEBFORMS);
            }, socketTimeout);

            this.socket.on(WebformEvent.LOAD_WEBFORMS_FINISHED, async (result: LoadWebformsResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    const webforms = [];
                    for (const object of result.webforms) {
                        const factoryObject = new Webform(object);
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

    public async createUpdateWebform(webform: Webform, formId?: number): Promise<number> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<number>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const request = new SaveWebformRequest(
                requestId, ClientStorageService.getClientRequestId(), webform, formId
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + WebformEvent.SAVE_WEBFORM);
            }, socketTimeout);

            this.socket.on(WebformEvent.WEBFORM_SAVED, async (result: CreateObjectResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    EventService.getInstance().publish(
                        ApplicationEvent.OBJECT_UPDATED, { objectType: KIXObjectType.WEBFORM }
                    );
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
