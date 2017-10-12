import { Server } from './../../../../Server';
import {
    ClientStorageHandler,
    SocketEvent,
    LoadUsersResult,
    UsersEvent,
    LoadUsersRequest,
    LoadWidgetRequest,
    LoadWidgetResponse,
    SaveConfigurationRequest,
    WidgetEvent,
    WidgetConfiguration
} from '@kix/core/dist/model/client';
import { WidgetSocketListener } from '@kix/core/dist/model/client/socket/widget/WidgetSocketListener';
import {
    USER_LIST_USERS_LOADED,
    USER_LIST_ERROR,
    WIDGET_LOADED
} from '../store/actions';

declare var io;

export class UserListSocketListener extends WidgetSocketListener {

    private usersSocket: SocketIO.Server;

    public constructor(store: any, widgetId: string, instanceId: string) {
        super(store, widgetId, instanceId);

        this.usersSocket = this.createSocket("users");
        this.initUsersSocketListener();
    }

    public loadUsers(loadUsersRequest: LoadUsersRequest): void {
        this.usersSocket.emit(UsersEvent.LOAD_USERS, loadUsersRequest);
    }

    protected handleWidgetSocketError(error: any): void {
        this.store.dispatch(USER_LIST_ERROR(String(error)));
    }

    protected widgetLoaded(configuration: WidgetConfiguration): void {
        this.store.dispatch(WIDGET_LOADED(configuration));
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
