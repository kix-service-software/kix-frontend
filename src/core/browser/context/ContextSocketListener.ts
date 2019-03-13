import { SocketListener } from "../SocketListener";
import {
    ContextConfiguration,
    ContextEvent,
    LoadContextConfigurationRequest,
    LoadContextConfigurationResponse,
    SaveContextConfigurationRequest,
    SaveWidgetRequest,
    WidgetConfiguration
} from "../../model";
import { ClientStorageService } from "../ClientStorageService";

export class ContextSocketListener extends SocketListener {

    public static getInstance(): ContextSocketListener {
        if (!ContextSocketListener.INSTANCE) {
            ContextSocketListener.INSTANCE = new ContextSocketListener();
        }

        return ContextSocketListener.INSTANCE;
    }

    private static INSTANCE: ContextSocketListener = null;

    private constructor() {
        super();
        this.socket = this.createSocket('context', true);
    }

    public loadContextConfiguration<T extends ContextConfiguration>(contextId: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {

            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.LOAD_CONTEXT_CONFIGURATION);
            }, 30000);

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATION_LOADED, (result: LoadContextConfigurationResponse<T>) => {
                window.clearTimeout(timeout);
                resolve(result.contextConfiguration);
            });

            this.socket.emit(
                ContextEvent.LOAD_CONTEXT_CONFIGURATION, new LoadContextConfigurationRequest(token, contextId)
            );

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATION_LOAD_ERROR, (error: string) => {
                window.clearTimeout(timeout);
                console.error(error);
                reject(error);
            });
        });
    }

    public saveWidgetConfiguration<T = any>(
        instanceId: string, widgetConfiguration: WidgetConfiguration<T>, contextId: string
    ): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.SAVE_WIDGET_CONFIGURATION);
            }, 30000);

            this.socket.on(ContextEvent.WIDGET_CONFIGURATION_SAVED, () => {
                window.clearTimeout(timeout);
                resolve();
            });

            const request = new SaveWidgetRequest(
                token,
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
                contextId,
                dashboardConfiguration
            );

            this.socket.emit(ContextEvent.SAVE_CONTEXT_CONFIGURATION, request);
        });
    }
}
