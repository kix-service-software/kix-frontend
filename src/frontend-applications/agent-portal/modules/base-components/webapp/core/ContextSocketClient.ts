/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from './SocketClient';
import { ClientStorageService } from './ClientStorageService';
import { ContextEvent } from './ContextEvent';
import { LoadContextConfigurationResponse } from './LoadContextConfigurationResponse';
import { LoadContextConfigurationRequest } from './LoadContextConfigurationRequest';
import { SocketErrorResponse } from './SocketErrorResponse';
import { SocketEvent } from './SocketEvent';
import { ContextConfiguration } from '../../../../model/configuration/ContextConfiguration';
import { IdService } from '../../../../model/IdService';
import { ISocketRequest } from './ISocketRequest';
import { ISocketResponse } from './ISocketResponse';
import { ContextPreference } from '../../../../model/ContextPreference';
import { KIXModulesService } from './KIXModulesService';

export class ContextSocketClient extends SocketClient {

    public static getInstance(): ContextSocketClient {
        if (!ContextSocketClient.INSTANCE) {
            ContextSocketClient.INSTANCE = new ContextSocketClient();
        }

        return ContextSocketClient.INSTANCE;
    }

    private static INSTANCE: ContextSocketClient = null;

    private constructor() {
        super('context');
    }

    public async loadContextConfiguration(contextId: string): Promise<ContextConfiguration> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<ContextConfiguration>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.LOAD_CONTEXT_CONFIGURATION);
            }, socketTimeout);

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATION_LOADED,
                (result: LoadContextConfigurationResponse<ContextConfiguration>) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.contextConfiguration);
                    }
                }
            );

            this.socket.emit(
                ContextEvent.LOAD_CONTEXT_CONFIGURATION, new LoadContextConfigurationRequest(
                    requestId, ClientStorageService.getClientRequestId(), contextId,
                    KIXModulesService.application
                )
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });
        });
    }

    public async loadContextConfigurations(application: string): Promise<ContextConfiguration[]> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<ContextConfiguration[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.LOAD_CONTEXT_CONFIGURATIONS);
            }, socketTimeout);

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATIONS_LOADED,
                (result) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.configurations);
                    }
                }
            );

            const request = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId(),
                application: application
            };
            this.socket.emit(ContextEvent.LOAD_CONTEXT_CONFIGURATIONS, request);

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });
        });
    }

    public async rebuildConfiguration(): Promise<void> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.REBUILD_CONFIG);
            }, socketTimeout);

            this.socket.on(ContextEvent.REBUILD_CONFIG_FINISHED,
                (result: ISocketResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve();
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
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(ContextEvent.REBUILD_CONFIG, request);
        });
    }

    public async loadStoredContexts(): Promise<ContextPreference[]> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<ContextPreference[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.LOAD_STORED_CONTEXTS);
            }, socketTimeout);

            this.socket.on(ContextEvent.LOAD_STORED_CONTEXTS_FINISCHED,
                (result: any) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.contextPreferences);
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

            const request = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(ContextEvent.LOAD_STORED_CONTEXTS, request);
        });
    }

    public async storeContext(contextPreference: ContextPreference): Promise<void> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.STORE_CONTEXT);
            }, socketTimeout);

            this.socket.on(ContextEvent.STORE_CONTEXT_FINISCHED,
                (result: ISocketResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve();
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

            const request = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId(),
                contextPreference
            };

            this.socket.emit(ContextEvent.STORE_CONTEXT, request);
        });
    }

    public async removeStoredContext(instanceId: string): Promise<void> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.REMOVE_STORED_CONTEXT);
            }, socketTimeout);

            this.socket.on(ContextEvent.REMOVE_STORED_CONTEXT_FINISHED,
                (result: ISocketResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve();
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

            const request = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId(),
                instanceId
            };

            this.socket.emit(ContextEvent.REMOVE_STORED_CONTEXT, request);
        });
    }
}
