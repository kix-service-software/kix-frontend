import { LoadUsersRequest } from './../../../../model/client/socket/users/LoadUsersRequest';
import { LoadConfigurationRequest } from './../../../../model/client/socket/configuration/LoadConfigurationRequest';
import { UserListConfiguration } from './../model/UserListConfiguration';
import { LoadConfigurationResult } from './../../../../model/client/socket/configuration/LoadConfigurationResult';
import { LoadUsersResult, UsersEvent } from './../../../../model/client/socket/users/';
import { SocketEvent } from '../../../../model/client/socket/SocketEvent';
import { ConfigurationEvent } from '../../../../model/client/socket/configuration';
import {
    USER_LIST_USERS_LOADED,
    USER_LIST_CONFIGURATION_LOADED,
    USER_LIST_ERROR
} from '../store/actions';

declare var io;

export class UserListSocketListener {

    private usersSocket: SocketIO.Server;

    private configurationSocket: SocketIO.Server;

    private store: any;

    public constructor(frontendSocketUrl: string) {
        const token = window.localStorage.getItem("token");
        this.usersSocket = io.connect(frontendSocketUrl + "/users", {
            query: "Token=" + token
        });

        this.configurationSocket = io.connect(frontendSocketUrl + "/configuration", {
            query: "Token=" + token
        });

        this.store = require('../store/');
        this.initConfigruationSocketListener();
        this.initUsersSocketListener();
    }

    private initConfigruationSocketListener(): void {
        this.configurationSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(USER_LIST_ERROR(null));
            const token = window.localStorage.getItem("token");
            this.configurationSocket.emit(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION,
                new LoadConfigurationRequest(
                    token,
                    'dashboard_user-list',
                    true
                )
            );
        });

        this.configurationSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(USER_LIST_ERROR(String(error)));
        });

        this.configurationSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(USER_LIST_ERROR('Timeout!'));
        });

        this.configurationSocket.on('error', (error) => {
            this.store.dispatch(USER_LIST_ERROR(String(error)));
        });

        this.configurationSocket.on(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED,
            (result: LoadConfigurationResult<UserListConfiguration>) => {
                this.store.dispatch(USER_LIST_CONFIGURATION_LOADED(result.configuration));

                const token = window.localStorage.getItem("token");
                this.usersSocket.emit(UsersEvent.LOAD_USERS,
                    new LoadUsersRequest(
                        token,
                        'dashboard_user-list',
                        result.configuration.properties,
                        result.configuration.limit
                    )
                );
            });
    }

    private initUsersSocketListener(): void {
        this.usersSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(USER_LIST_ERROR(null));
        });

        this.usersSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(USER_LIST_ERROR(String(error)));
        });

        this.usersSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(USER_LIST_ERROR('Timeout!'));
        });

        this.usersSocket.on('error', (error) => {
            this.store.dispatch(USER_LIST_ERROR(String(error)));
        });

        this.usersSocket.on(UsersEvent.USERS_LOADED, (result: LoadUsersResult) => {
            this.store.dispatch(USER_LIST_USERS_LOADED(result));
        });
    }
}
