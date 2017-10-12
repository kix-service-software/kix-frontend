import {
    SidebarConfiguration,
    LoadConfigurationResult,
    LoadConfigurationRequest,
    SocketEvent,
    ClientStorageHandler,
    ConfigurationEvent
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';

import {
    SIDEBAR_CONFIGURATION_LOADED,
    SIDEBAR_ERROR
} from '../store/actions';

export class SidebarSocketListener extends SocketListener {

    private configurationSocket: SocketIO.Server;
    private store: any;

    public constructor(store: any) {
        super();

        this.store = store;
        this.configurationSocket = this.createSocket("configuration");
        this.initConfigruationSocketListener(this.configurationSocket);
    }

    private initConfigruationSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(SIDEBAR_ERROR(null));
            const token = ClientStorageHandler.getToken();
            const loadRequest =
                new LoadConfigurationRequest(token, ClientStorageHandler.getContextId(), 'sidebar', null, true);

            socket.emit(ConfigurationEvent.LOAD_SIDEBAR_CONFIGURATION, loadRequest);
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(SIDEBAR_ERROR(String(error)));
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(SIDEBAR_ERROR('Timeout!'));
        });

        socket.on('error', (error) => {
            this.store.dispatch(SIDEBAR_ERROR(String(error)));
        });

        socket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED,
            (result: LoadConfigurationResult<SidebarConfiguration>) => {
                this.store.dispatch(SIDEBAR_CONFIGURATION_LOADED(result.configuration));
            }
        );

        socket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED, () => {
            alert('Configuration saved!');
        });
    }
}
