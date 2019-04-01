import { SocketClient } from "../SocketClient";
import {
    ContextConfiguration,
    ContextEvent,
    LoadContextConfigurationRequest,
    LoadContextConfigurationResponse,
    SaveContextConfigurationRequest,
    SaveWidgetRequest,
    WidgetConfiguration,
    ISocketResponse
} from "../../model";
import { ClientStorageService } from "../ClientStorageService";
import { IdService } from "../IdService";
import { SocketErrorResponse } from "../../common";

export class ContextSocketClient extends SocketClient {

    public static getInstance(): ContextSocketClient {
        if (!ContextSocketClient.INSTANCE) {
            ContextSocketClient.INSTANCE = new ContextSocketClient();
        }

        return ContextSocketClient.INSTANCE;
    }

    private static INSTANCE: ContextSocketClient = null;

    private constructor() {
        super();
        this.socket = this.createSocket('context', true);
    }

    public loadContextConfiguration<T extends ContextConfiguration>(contextId: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.LOAD_CONTEXT_CONFIGURATION);
            }, 30000);

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATION_LOADED, (result: LoadContextConfigurationResponse<T>) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.contextConfiguration);
                }
            });

            this.socket.emit(
                ContextEvent.LOAD_CONTEXT_CONFIGURATION, new LoadContextConfigurationRequest(
                    token, requestId, ClientStorageService.getClientRequestId(), contextId
                )
            );

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATION_LOAD_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });
        });
    }

    public saveWidgetConfiguration<T = any>(
        instanceId: string, widgetConfiguration: WidgetConfiguration<T>, contextId: string
    ): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.SAVE_WIDGET_CONFIGURATION);
            }, 30000);

            this.socket.on(ContextEvent.WIDGET_CONFIGURATION_SAVED, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve();
                }
            });

            const request = new SaveWidgetRequest(
                token,
                requestId,
                ClientStorageService.getClientRequestId(),
                contextId,
                instanceId,
                widgetConfiguration
            );
            this.socket.emit(ContextEvent.SAVE_WIDGET_CONFIGURATION, request);
        });
    }

    public saveContextConfiguration(
        dashboardConfiguration: ContextConfiguration, contextId: string
    ): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.SAVE_CONTEXT_CONFIGURATION);
            }, 30000);

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATION_SAVED, () => {
                window.clearTimeout(timeout);
                resolve();
            });

            const request = new SaveContextConfigurationRequest(
                token,
                requestId,
                ClientStorageService.getClientRequestId(),
                contextId,
                dashboardConfiguration
            );

            this.socket.emit(ContextEvent.SAVE_CONTEXT_CONFIGURATION, request);
        });
    }
}
