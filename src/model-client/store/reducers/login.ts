import {
    LoginRequest,
    UserType,
    LoginState,
    AuthenticationEvent,
    AuthenticationResult
} from './../../authentication/';
import { SocketEvent } from '../../';
import { LOGIN_ERROR } from '../actions';

class LoginActionHandler {

    private socket: SocketIO.Server;

    public handleLoginAction(state: LoginState, action): LoginState {

        switch (action.type) {
            case 'LOGIN_ERROR_FULFILLED':
                return {
                    ...state,
                    error: action.payload.error
                };

            case 'LOGIN_USERNAME_CHANGED_FULFILLED':
                return {
                    ...state,
                    userName: action.payload.userName
                };

            case 'LOGIN_PASSWORD_CHANGED_FULFILLED':
                return {
                    ...state,
                    password: action.payload.password
                };

            case 'LOGIN_VALIDATE_FULFILLED':
                return {
                    ...state,
                    valid: action.payload.valid
                };

            case 'LOGIN_CONNECT_FULFILLED':
                this.initSocketCommunication(action.payload.socket);
                return {
                    ...state,
                    socket: action.payload.socket
                };

            case 'LOGIN_AUTH_FULFILLED':
                this.doLogin(action.payload.userName, action.payload.password);
                return state;

            default:
                return {
                    ...state
                };
        }
    }

    private initSocketCommunication(socket: SocketIO.Server): void {
        const store = require('./../');

        this.socket = socket;
        this.socket.on(SocketEvent.CONNECT, () => {
            store.dispatch(LOGIN_ERROR(null));
            console.log("connected to socket server.");
        });

        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            store.dispatch(LOGIN_ERROR('Connection to socket server failed. ' + JSON.stringify(error)));
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            store.dispatch(LOGIN_ERROR('Connection to socket server timeout.'));
        });

        this.socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
            window.localStorage.setItem('token', result.token);
            window.location.replace(result.redirectUrl);
        });

        this.socket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
            store.dispatch(LOGIN_ERROR(error));
        });
    }

    private doLogin(userName: string, password: string): void {
        const store = require('./../');

        this.socket.emit(AuthenticationEvent.LOGIN,
            new LoginRequest(userName, password, UserType.AGENT));
    }
}

const loginActionHandler = new LoginActionHandler();

export default (state, action) => {
    state = state || new LoginState();

    return loginActionHandler.handleLoginAction(state, action);
};
