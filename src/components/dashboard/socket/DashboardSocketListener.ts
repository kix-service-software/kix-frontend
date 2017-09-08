import { LoadConfigurationRequest } from './../../../model/client/socket/configuration/LoadConfigurationRequest';
import { TokenHandler } from './../../../model/client/TokenHandler';
import { ContainerConfiguration } from './../../base-components/dragable-container/model/ContainerConfiguration';
import { SocketEvent } from '../../../model/client/socket/SocketEvent';
import { ConfigurationEvent, LoadConfigurationResult } from '../../../model/client/socket/configuration';
import {
    DASHBOARD_CONTAINER_CONFIGURATION_LOADED
} from '../store/actions';

declare var io: any;

export class DashboardSocketListener {

    private configurationSocket: SocketIO.Server;

    private store: any;

    public constructor(frontendSocketUrl: string) {
        const token = TokenHandler.getToken();
        this.configurationSocket = io.connect(frontendSocketUrl + "/configuration", {
            query: "Token=" + token
        });
        this.store = require('../store/');
        this.initConfigurationSocketListener(this.configurationSocket);
    }

    private initConfigurationSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            const token = TokenHandler.getToken();
            socket.emit(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION,
                new LoadConfigurationRequest(token, 'dashboard', true));
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
