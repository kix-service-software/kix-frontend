import {
    ConfigurationEvent,
    LoadConfigurationResult,
    SocketEvent,
    LoadConfigurationRequest,
    ContainerConfiguration
} from '@kix/core/dist/model';
import { SocketListener } from '@kix/core/dist/browser/SocketListener';
import { TICKET_CONTAINER_CONFIGURATION_LOADED } from '../store/actions';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

export class CMDBSocketListener extends SocketListener {

    private configurationSocket: SocketIO.Server;

    private store: any;

    public constructor() {
        super();
        this.store = require('../store/');
        this.configurationSocket = this.createSocket("configuration");
        this.initConfigurationSocketListener(this.configurationSocket);
    }

    private initConfigurationSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            const token = ClientStorageHandler.getToken();
            const loadRequest = new LoadConfigurationRequest(
                token, ClientStorageHandler.getContextId(), null, null, true);

            socket.emit(ConfigurationEvent.LOAD_MODULE_CONFIGURATION, loadRequest);
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
            this.configurationSocket.close();
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
            this.configurationSocket.close();
        });

        socket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED,
            (result: LoadConfigurationResult<ContainerConfiguration>) => {
                this.store.dispatch(TICKET_CONTAINER_CONFIGURATION_LOADED(result.configuration));
            });

        socket.on('error', (error) => {
            console.error(error);
            this.configurationSocket.close();
        });
    }
}
