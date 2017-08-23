import {
    AuthenticationResult,
    AuthenticationEvent,
    LoginRequest,
    LoginComponentState,
    LoginState,
    UserType
} from './../../model-client/authentication';

import { SocketEvent } from './../../model-client';

import {
    LOGIN_USERNAME_CHANGED,
    LOGIN_PASSWORD_CHANGED,
    LOGIN_VALIDATE
} from '../../model-client/store/actions';

declare var io;

class LoginFormComponent {

    public state: LoginComponentState;

    public socket: SocketIO.Server;

    public store;

    public onCreate(input: any): void {
        this.state = new LoginComponentState(input.frontendSocketUrl);
    }

    public stateChanged(): void {
        const reduxState: LoginState = this.store.getState().login;
        this.state.userName = reduxState.userName;
        this.state.password = reduxState.password;
        this.state.valid = reduxState.valid;
    }

    public onMount(): void {
        this.store = require('../../model-client/store');
        this.store.subscribe(this.stateChanged.bind(this));

        this.socket = io.connect(this.state.frontendSocketUrl + "/authentication", {});

        this.socket.on(SocketEvent.CONNECT, () => {
            this.state.error = null;
            console.log("connected to socket server.");
        });

        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.state.error = 'Connection to socket server failed. ' + JSON.stringify(error);
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.state.error = 'Connection to socket server timeout.';
        });
    }

    public login(): void {
        this.socket.emit(AuthenticationEvent.LOGIN,
            new LoginRequest(this.state.userName, this.state.password, UserType.AGENT));

        this.socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
            window.localStorage.setItem('token', result.token);
            window.location.replace(result.redirectUrl);
        });

        this.socket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
            this.state.error = error;
        });
    }

    public userNameChanged(event: any): void {
        this.store.dispatch(LOGIN_USERNAME_CHANGED(event.target.value)).then(() => {
            this.store.dispatch(LOGIN_VALIDATE(this.state.userName, this.state.password));
        });
    }

    public passwordChanged(event: any): void {
        this.store.dispatch(LOGIN_PASSWORD_CHANGED(event.target.value)).then(() => {
            this.store.dispatch(LOGIN_VALIDATE(this.state.userName, this.state.password));
        });
    }
}

module.exports = LoginFormComponent;
