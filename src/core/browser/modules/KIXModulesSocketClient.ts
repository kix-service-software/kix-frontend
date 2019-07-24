/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    LoadKIXModulesRequest, KIXModulesEvent, LoadKIXModulesResponse, Form, FormContext,
    KIXObjectType, LoadFormConfigurationsResponse, LoadFormConfigurationsRequest,
    ISocketRequest, LoadReleaseInfoResponse, ReleaseInfo, LoadObjectDefinitionsResponse,
    SocketEvent
} from '../../model';

import { SocketClient } from '../SocketClient';
import { ClientStorageService } from '../ClientStorageService';
import { IKIXModuleExtension } from '../../extensions';
import { IdService } from '../IdService';
import { SocketErrorResponse } from '../../common';
import { ObjectDefinition } from '../../model/kix/object-definition';

export class KIXModulesSocketClient extends SocketClient {

    public static getInstance(): KIXModulesSocketClient {
        if (!KIXModulesSocketClient.INSTANCE) {
            KIXModulesSocketClient.INSTANCE = new KIXModulesSocketClient();
        }

        return KIXModulesSocketClient.INSTANCE;
    }

    private static INSTANCE: KIXModulesSocketClient = null;

    public constructor() {
        super();
        this.socket = this.createSocket('kixmodules', true);
    }

    public loadModules(): Promise<IKIXModuleExtension[]> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadKIXModulesRequest(token, requestId, ClientStorageService.getClientRequestId());

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_MODULES);
            }, 30000);

            this.socket.on(KIXModulesEvent.LOAD_MODULES_FINISHED, (result: LoadKIXModulesResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.modules);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(KIXModulesEvent.LOAD_MODULES, request);
        });
    }

    public loadFormConfigurations(): Promise<[Form[], Array<[FormContext, KIXObjectType, string]>]> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadFormConfigurationsRequest(
                token, requestId, ClientStorageService.getClientRequestId()
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_FORM_CONFIGURATIONS);
            }, 30000);

            this.socket.on(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_FINISHED,
                (result: LoadFormConfigurationsResponse) => {
                    if (requestId === result.requestId) {
                        window.clearTimeout(timeout);
                        resolve([result.forms, result.formIDsWithContext]);
                    }
                }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS, request);
        });
    }

    public async loadReleaseConfig(): Promise<ReleaseInfo> {
        return new Promise<ReleaseInfo>((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_MODULES);
            }, 30000);

            this.socket.on(KIXModulesEvent.LOAD_RELEASE_INFO_FINISHED, (result: LoadReleaseInfoResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.releaseInfo);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                token,
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };
            this.socket.emit(KIXModulesEvent.LOAD_RELEASE_INFO, request);
        });
    }

    public async loadObjectDefinitions(): Promise<ObjectDefinition[]> {
        return new Promise<ObjectDefinition[]>((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_MODULES);
            }, 30000);

            this.socket.on(
                KIXModulesEvent.LOAD_OBJECT_DEFINITIONS_FINISHED,
                (result: LoadObjectDefinitionsResponse) => {
                    if (requestId === result.requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.objectDefinitions);
                    }
                }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                token,
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };
            this.socket.emit(KIXModulesEvent.LOAD_OBJECT_DEFINITIONS, request);
        });
    }
}
