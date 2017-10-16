import {
    DashboardEvent,
    LoadDashboardRequest,
    LoadDashboardResponse,
    SocketEvent,
    ClientStorageHandler,
    LoadConfigurationRequest,
    ContainerConfiguration
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';
import {
    DASHBOARD_CONTAINER_CONFIGURATION_LOADED
} from '../store/actions';

export class DashboardSocketListener extends SocketListener {

    private configurationSocket: SocketIO.Server;

    private store: any;

    public constructor() {
        super();
        this.store = require('../store/');
        this.configurationSocket = this.createSocket("dashboard");
        this.initConfigurationSocketListener(this.configurationSocket);
    }

    private initConfigurationSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            const token = ClientStorageHandler.getToken();
            const loadRequest = new LoadDashboardRequest(token, ClientStorageHandler.getContextId());

            socket.emit(DashboardEvent.LOAD_DASHBOARD, loadRequest);
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
        });

        socket.on(DashboardEvent.DASHBOARD_LOADED,
            (result: LoadDashboardResponse<ContainerConfiguration>) => {
                this.store.dispatch(
                    DASHBOARD_CONTAINER_CONFIGURATION_LOADED(result.configuration, result.widgetTemplates)
                );
            });

        socket.on('error', (error) => {
            console.error(error);
        });
    }
}
