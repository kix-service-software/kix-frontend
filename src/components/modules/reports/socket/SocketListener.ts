import {
    ConfigurationEvent,
    LoadConfigurationResult,
    SocketEvent,
    LoadConfigurationRequest
} from '@kix/core/dist/model';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { SocketListener } from '@kix/core/dist/browser/SocketListener';
import {
    REPORTS_CONTAINER_CONFIGURATION_LOADED
} from '../store/actions';

export class ReportsSocketListener extends SocketListener {

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
            (result: LoadConfigurationResult<any>) => {
                this.store.dispatch(REPORTS_CONTAINER_CONFIGURATION_LOADED(result.configuration));
            });

        socket.on('error', (error) => {
            console.error(error);
            this.configurationSocket.close();
        });
    }
}
