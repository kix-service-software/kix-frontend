import { SaveConfigurationRequest } from './../../../../model/client/socket/configuration/SaveConfigurationRequest';
import { LoadUsersRequest } from './../../../../model/client/socket/users/LoadUsersRequest';
import { LoadConfigurationRequest } from './../../../../model/client/socket/configuration/LoadConfigurationRequest';
import { LoadConfigurationResult } from './../../../../model/client/socket/configuration/LoadConfigurationResult';
import { LoadUsersResult, UsersEvent } from './../../../../model/client/socket/users/';
import { SocketEvent } from '../../../../model/client/socket/SocketEvent';
import { ConfigurationEvent } from '../../../../model/client/socket/configuration';
import { ClientStorageHandler } from '../../../../model/client/ClientStorageHandler';
import { SocketListener } from '../../../../model/client/socket/SocketListener';
import {
    WIDGET_CONFIGURATION_LOADED,
    WIDGET_ERROR
} from '../store/actions';

declare var io;

export class WidgetSocketListener extends SocketListener {

    private configurationSocket: SocketIO.Server;

    private store: any;

    private moduleId: string;

    private widgetId: string;

    public constructor(moduleId: string, widgetId: string, store: any) {
        super();
        this.moduleId = moduleId;
        this.widgetId = widgetId;

        this.configurationSocket = this.createSocket("configuration");

        this.store = store;
        this.initConfigruationSocketListener();
    }

    public saveConfiguration(configuration: any): void {
        this.configurationSocket.emit(ConfigurationEvent.SAVE_COMPONENT_CONFIGURATION,
            new SaveConfigurationRequest
                (configuration, ClientStorageHandler.getToken(), this.moduleId + '_' + this.widgetId, true));
    }

    private initConfigruationSocketListener(): void {
        this.configurationSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(WIDGET_ERROR(null));
            const token = ClientStorageHandler.getToken();
            this.configurationSocket.emit(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION,
                new LoadConfigurationRequest(
                    token,
                    this.moduleId + '_' + this.widgetId,
                    true
                )
            );
        });

        this.configurationSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(WIDGET_ERROR(String(error)));
        });

        this.configurationSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(WIDGET_ERROR('Timeout!'));
        });

        this.configurationSocket.on('error', (error) => {
            this.store.dispatch(WIDGET_ERROR(String(error)));
        });

        this.configurationSocket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED,
            (result: LoadConfigurationResult<any>) => {
                this.store.dispatch(WIDGET_CONFIGURATION_LOADED(result.configuration));
            }
        );

        this.configurationSocket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED, () => {
            alert('Configuration saved!');
        });
    }
}
