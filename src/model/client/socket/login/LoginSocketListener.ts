import { UserType } from '../../';
import { SocketEvent } from '../../socket/SocketEvent';
import { LOGIN_ERROR } from '../../store/login/actions';
import { AuthenticationEvent, AuthenticationResult, LoginRequest } from './';

declare var io: any;

export class LoginSocketListener {

    private socket: SocketIO.Server;
    private store: any;

    public constructor(frontendSocketUrl: string) {
        this.socket = io.connect(frontendSocketUrl + "/authentication", {});
        this.store = require('../../store/login/index');
        this.initSocketListener(this.socket);
    }

    public login(userName: string, password: string, userType: UserType): void {
        this.socket.emit(AuthenticationEvent.LOGIN,
            new LoginRequest(userName, password, UserType.AGENT));
    }

    private initSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(LOGIN_ERROR(null));
            console.log("connected to socket server.");
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(LOGIN_ERROR('Connection to socket server failed. ' + JSON.stringify(error)));
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(LOGIN_ERROR('Connection to socket server timeout.'));
        });

        socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
            window.localStorage.setItem('token', result.token);
            window.location.replace('/');
        });

        socket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
            this.store.dispatch(LOGIN_ERROR(error));
        });

        socket.on('error', (error) => {
            this.store.dispatch(LOGIN_ERROR(error));
        });
    }
}
