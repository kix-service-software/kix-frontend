import {
    LoadConfigurationResult,
    WidgetConfiguration,
    SaveConfigurationRequest,
    LoadWidgetRequest,
    LoadWidgetResponse,
    ClientStorageHandler,
    WidgetEvent,
    SocketEvent
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';

import {
    WIDGET_LOADED,
    WIDGET_ERROR
} from '../store/actions';

declare var io;

export class WidgetSocketListener extends SocketListener {

    private configurationSocket: SocketIO.Server;

    private store: any;

    private contextId: string;

    private widgetId: string;

    private instanceId: string;

    public constructor(widgetId: string, instanceId: string, store: any) {
        super();
        this.contextId = ClientStorageHandler.getContextId();
        this.widgetId = widgetId;
        this.instanceId = instanceId;

        this.configurationSocket = this.createSocket("widget");

        this.store = store;
        this.initConfigruationSocketListener();
    }

    public saveConfiguration(configuration: WidgetConfiguration): void {
        const saveRequest = new SaveConfigurationRequest
            (configuration, ClientStorageHandler.getToken(),
            ClientStorageHandler.getContextId(), this.widgetId, this.instanceId, true);

        this.configurationSocket.emit(WidgetEvent.SAVE_WIDGET_CONFIGURATION, saveRequest);
    }

    private initConfigruationSocketListener(): void {
        this.configurationSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(WIDGET_ERROR(null));
            const token = ClientStorageHandler.getToken();
            const loadRequest = new LoadWidgetRequest(
                token, this.contextId, this.widgetId, this.instanceId, true);

            this.configurationSocket.emit(WidgetEvent.LOAD_WIDGET, loadRequest);
        });

        this.configurationSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(WIDGET_ERROR(String(error)));
        });

        this.configurationSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(WIDGET_ERROR('Timeout!'));
        });

        this.configurationSocket.on('error', (error) => {
            this.store.dispatch(WIDGET_ERROR(String(error)));
        });

        this.configurationSocket.on(WidgetEvent.WIDGET_LOADED,
            (result: LoadWidgetResponse) => {
                this.store.dispatch(WIDGET_LOADED(result));
            }
        );

        this.configurationSocket.on(WidgetEvent.WIDGET_CONFIGURATION_SAVED, () => {
            alert('Configuration saved!');
        });
    }
}
