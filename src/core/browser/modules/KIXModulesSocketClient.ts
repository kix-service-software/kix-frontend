import {
    LoadKIXModulesRequest, KIXModulesEvent, LoadKIXModulesResponse, Form, FormContext,
    KIXObjectType, LoadFormConfigurationsResponse, LoadFormConfigurationsRequest
} from '../../model';

import { SocketClient } from '../SocketClient';
import { ClientStorageService } from '../ClientStorageService';
import { IKIXModuleExtension } from '../../extensions';
import { IdService } from '../IdService';
import { SocketErrorResponse } from '../../common';

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

            this.socket.on(KIXModulesEvent.LOAD_MODULES_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
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

            this.socket.on(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    reject(error.error);
                }
            });

            this.socket.emit(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS, request);
        });
    }
}
