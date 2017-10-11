import { Server } from './../../../../Server';
import {
    ClientStorageHandler,
    SocketEvent,
    LoadUsersResult,
    UsersEvent,
    LoadUsersRequest,
    LoadWidgetRequest,
    LoadWidgetResponse,
    WidgetEvent
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';
import {
    USER_LIST_USERS_LOADED,
    USER_LIST_ERROR,
    WIDGET_LOADED
} from '../store/actions';

declare var io;

export class UserListSocketListener extends SocketListener {

    private usersSocket: SocketIO.Server;

    private widgetSocket: SocketIO.Server;

    private store: any;

    private widgetId: string;

    private instanceId: string;

    public constructor(store: any, widgetId: string, instanceId: string) {
        super();

        this.store = store;

        this.widgetId = widgetId;
        this.instanceId = instanceId;

        this.usersSocket = this.createSocket("users");
        this.widgetSocket = this.createSocket("widget");

        this.initUsersSocketListener();
        this.initWidgetSocketListener();
    }

    public loadUsers(loadUsersRequest: LoadUsersRequest): void {
        this.usersSocket.emit(UsersEvent.LOAD_USERS, loadUsersRequest);
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

    private initWidgetSocketListener(): void {
        this.widgetSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(USER_LIST_ERROR(null));
            this.widgetSocket.emit(
                WidgetEvent.LOAD_WIDGET,
                new LoadWidgetRequest(
                    ClientStorageHandler.getToken(), 'dashboard', this.widgetId, this.instanceId, true
                )
            );
        });

        this.widgetSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(USER_LIST_ERROR(String(error)));
        });

        this.widgetSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(USER_LIST_ERROR('Timeout!'));
        });

        this.widgetSocket.on('error', (error) => {
            this.store.dispatch(USER_LIST_ERROR(String(error)));
        });

        this.widgetSocket.on(WidgetEvent.WIDGET_LOADED, (result: LoadWidgetResponse) => {
            this.store.dispatch(WIDGET_LOADED(result.configuration));
        });
    }
}
