import { LoadUsersResult, UsersEvent } from './../../../../model/client/socket/users/';
import { SocketEvent } from '../../../../model/client/socket/SocketEvent';
import { USER_LIST_LOAD_USERS, USER_LIST_USERS_LOADED } from '../store/actions';

export class UserListSocketListener {
    private socket: SocketIO.Server;

    private store: any;

    public constructor(frontendSocketUrl: string) {
        const token = window.localStorage.getItem("token");
        this.socket = io.connect(frontendSocketUrl + "/users", {
            query: "Token=" + token
        });
        this.store = require('../store/');
        this.initSocketListener();
    }

    private initSocketListener(): void {
        this.socket.on(SocketEvent.CONNECT, () => {
            console.log("connected to socket server users.");
            this.store.dispatch(USER_LIST_LOAD_USERS(this.socket));
        });

        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
        });

        this.socket.on('error', (error) => {
            console.error(error);
        });

        this.socket.on(UsersEvent.USERS_LOADED, (result: LoadUsersResult) => {
            this.store.dispatch(USER_LIST_USERS_LOADED(result.user));
        });
    }
}
