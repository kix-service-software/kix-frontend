import {
    ClientStorageHandler,
    ConfigurationEvent,
    SocketEvent,
    LoadConfigurationResult,
    LoadConfigurationRequest,
    SaveConfigurationRequest
} from '@kix/core';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';
import {
    SIDEBAR_CONFIGURATION_LOADED,
    SIDEBAR_ERROR
} from '../store/actions';

declare var io;

export class SidebarSocketListener extends SocketListener {

    private configurationSocket: SocketIO.Server;

    private store: any;

    private contextId: string;

    private sidebarId: string;

    public constructor(sidebarId: string, store: any) {
        super();
        this.contextId = ClientStorageHandler.getContextId();
        this.sidebarId = sidebarId;

        this.configurationSocket = this.createSocket("configuration");

        this.store = store;
        this.initConfigruationSocketListener();
    }

    public saveConfiguration(configuration: any): void {
        const saveRequest = new SaveConfigurationRequest
            (configuration, ClientStorageHandler.getToken(), ClientStorageHandler.getContextId(), this.sidebarId, true);

        this.configurationSocket.emit(ConfigurationEvent.SAVE_COMPONENT_CONFIGURATION, saveRequest);
    }

    private initConfigruationSocketListener(): void {
        this.configurationSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(SIDEBAR_ERROR(null));
            const token = ClientStorageHandler.getToken();

            const loadRequest = new LoadConfigurationRequest(token, this.contextId, this.sidebarId, true);

            this.configurationSocket.emit(ConfigurationEvent.LOAD_SIDEBAR_CONFIGURATION, loadRequest);
        });

        this.configurationSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(SIDEBAR_ERROR(String(error)));
        });

        this.configurationSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(SIDEBAR_ERROR('Timeout!'));
        });

        this.configurationSocket.on('error', (error) => {
            this.store.dispatch(SIDEBAR_ERROR(String(error)));
        });

        this.configurationSocket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED,
            (result: LoadConfigurationResult<any>) => {
                this.store.dispatch(SIDEBAR_CONFIGURATION_LOADED(result.configuration));
            }
        );

        this.configurationSocket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED, () => {
            alert('Configuration saved!');
        });
    }
}
