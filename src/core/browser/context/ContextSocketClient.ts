import { SocketClient } from "../SocketClient";
import {
    ContextConfiguration, ContextEvent, LoadContextConfigurationRequest, LoadContextConfigurationResponse, SocketEvent,
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

    public static loadContextConfiguration(contextId: string): Promise<ContextConfiguration> {
        return new Promise<ContextConfiguration>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.LOAD_CONTEXT_CONFIGURATION);
            }, 30000);

            this.getInstance().socket.on(ContextEvent.CONTEXT_CONFIGURATION_LOADED,
                (result: LoadContextConfigurationResponse<ContextConfiguration>) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.contextConfiguration);
                    }
                }
            );

            this.getInstance().socket.emit(
                ContextEvent.LOAD_CONTEXT_CONFIGURATION, new LoadContextConfigurationRequest(
                    token, requestId, ClientStorageService.getClientRequestId(), contextId
                )
            );

            this.getInstance().socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });
        });
    }
}
