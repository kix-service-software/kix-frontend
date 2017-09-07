import { ContainerConfiguration } from './../../base-components/dragable-container/model/ContainerConfiguration';
import { SocketEvent } from '../../../model/client/socket/SocketEvent';
import { ConfigurationEvent, LoadConfigurationResult } from '../../../model/client/socket/configuration';
import {
    DASHBOARD_LOAD_CONTAINER_CONFIG, DASHBOARD_CONTAINER_CONFIGURATION_LOADED
} from '../store/actions';

declare var io: any;

export class DashboardSocketListener {

    private configurationSocket: SocketIO.Server;

    private store: any;

    public constructor(frontendSocketUrl: string) {
        const token = window.localStorage.getItem("token");
        this.configurationSocket = io.connect(frontendSocketUrl + "/configuration", {
            query: "Token=" + token
        });
        this.store = require('../store/');
        this.initConfigurationSocketListener(this.configurationSocket);
    }

    private initConfigurationSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            console.log("connected to socket server /communication.");
            this.store.dispatch(DASHBOARD_LOAD_CONTAINER_CONFIG(socket));
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
