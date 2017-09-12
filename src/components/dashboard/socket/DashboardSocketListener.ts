import { LoadConfigurationRequest } from './../../../model/client/socket/configuration/LoadConfigurationRequest';
import { ClientStorageHandler } from '../../../model/client/ClientStorageHandler';
import { ContainerConfiguration } from './../../base-components/dragable-container/model/ContainerConfiguration';
import { SocketEvent } from '../../../model/client/socket/SocketEvent';
import { ConfigurationEvent, LoadConfigurationResult } from '../../../model/client/socket/configuration';
import { SocketListener } from '../../../model/client/socket/SocketListener';
import {
    DASHBOARD_CONTAINER_CONFIGURATION_LOADED
} from '../store/actions';

export class DashboardSocketListener extends SocketListener {

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
            const loadRequest = new LoadConfigurationRequest(token, ClientStorageHandler.getContextId(), null, true);

            socket.emit(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION, loadRequest);
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
        });

        socket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED,
            (result: LoadConfigurationResult<ContainerConfiguration>) => {
                this.store.dispatch(DASHBOARD_CONTAINER_CONFIGURATION_LOADED(result.configuration));
            });

        socket.on('error', (error) => {
            console.error(error);
        });
    }
}
