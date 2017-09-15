import { KixSidebarConfiguration } from './../../../../model/client/components/';
import { SaveConfigurationRequest } from './../../../../model/client/socket/configuration/SaveConfigurationRequest';
import { LoadConfigurationRequest } from './../../../../model/client/socket/configuration/LoadConfigurationRequest';
import { LoadConfigurationResult } from './../../../../model/client/socket/configuration/LoadConfigurationResult';
import { SocketEvent } from '../../../../model/client/socket/SocketEvent';
import { ConfigurationEvent } from '../../../../model/client/socket/configuration';
import { ClientStorageHandler } from '../../../../model/client/ClientStorageHandler';
import { SocketListener } from '../../../../model/client/socket/SocketListener';
import {
    KIX_SIDEBAR_CONFIGURATION_LOADED,
    KIX_SIDEBAR_ERROR
} from '../store/actions';

declare var io;

export class KixSidebarSocketListener extends SocketListener {

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
            this.store.dispatch(KIX_SIDEBAR_ERROR(null));
            const token = ClientStorageHandler.getToken();
            const loadRequest =
                new LoadConfigurationRequest(token, ClientStorageHandler.getContextId(), 'kix-sidebar', true);

            socket.emit(ConfigurationEvent.LOAD_KIX_SIDEBAR_CONFIGURATION, loadRequest);
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(KIX_SIDEBAR_ERROR(String(error)));
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(KIX_SIDEBAR_ERROR('Timeout!'));
        });

        socket.on('error', (error) => {
            this.store.dispatch(KIX_SIDEBAR_ERROR(String(error)));
        });

        socket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED,
            (result: LoadConfigurationResult<KixSidebarConfiguration>) => {
                this.store.dispatch(KIX_SIDEBAR_CONFIGURATION_LOADED(result.configuration));
            }
        );

        socket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED, () => {
            alert('Configuration saved!');
        });
    }
}
