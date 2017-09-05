import { ContainerConfiguration } from './../../components/dragable-container/ContainerConfiguration';
import { SocketEvent } from '../SocketEvent';
import { ConfigurationEvent, LoadConfigurationResult } from '../configuration';
import {
    DASHBOARD_LOAD_CONTAINER_CONFIG, DASHBOARD_CONTAINER_CONFIGURATION_LOADED
} from '../../store/dashboard/actions';

declare var io: any;

export class DashboardSocketListener {

    private configurationSocket: SocketIO.Server;

    private store: any;

    public constructor(frontendSocketUrl: string) {
        this.configurationSocket = io.connect(frontendSocketUrl + "/configuration", {});
        this.store = require('../../store/dashboard');
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
