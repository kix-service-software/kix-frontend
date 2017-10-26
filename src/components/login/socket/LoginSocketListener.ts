import {
    ClientStorageHandler,
    AuthenticationEvent,
    AuthenticationResult,
    LoginRequest,
    SocketEvent,
    UserType
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';

import { LOGIN_ERROR } from '../store/actions';

import { LoginTranslationId } from '../model/LoginTranslationId';

export class LoginSocketListener extends SocketListener {

    private authenticationSocket: SocketIO.Server;
    private store: any;

    public constructor() {
        super();

        this.authenticationSocket = this.createSocket("authentication", false);
        this.store = require('../store');
        this.initAuthenticationSocketListener();
    }

    public login(userName: string, password: string, userType: UserType): void {
        this.authenticationSocket.emit(AuthenticationEvent.LOGIN,
            new LoginRequest(userName, password, UserType.AGENT));
    }

    private initAuthenticationSocketListener(): void {
        this.authenticationSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(LOGIN_ERROR(null));
        });

        this.authenticationSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(LOGIN_ERROR('Connection to socket server failed. ' + JSON.stringify(error)));
            this.authenticationSocket.close();
        });

        this.authenticationSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(LOGIN_ERROR('Connection to socket server timeout.'));
            this.authenticationSocket.close();
        });

        this.authenticationSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
            document.cookie = "token=" + result.token;
            window.location.replace('/');
        });

        this.authenticationSocket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
            this.store.dispatch(LOGIN_ERROR('Invalid Login.'));
        });

        this.authenticationSocket.on('error', (error) => {
            this.store.dispatch(LOGIN_ERROR(error));
            this.authenticationSocket.close();
        });
    }
}
