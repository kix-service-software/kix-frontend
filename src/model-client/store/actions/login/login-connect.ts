import { SocketEvent } from '../../../';
import { LOGIN_ERROR } from '../../actions';
import {
    LoginRequest,
    UserType,
    LoginState,
    AuthenticationEvent,
    AuthenticationResult
} from './../../../authentication/';

declare var io: any;

export default (frontendSocketUrl: string) => {
    return {
        type: 'LOGIN_CONNECT',
        payload: new Promise((resolve, reject) => {
            const socket = io.connect(frontendSocketUrl + "/authentication", {});
            initSocketListener(socket);
            resolve(
                {
                    socket
                }
            );
        })
    };
};

function initSocketListener(socket: SocketIO.Server): void {
    const store = require('../../');
    socket.on(SocketEvent.CONNECT, () => {
        store.dispatch(LOGIN_ERROR(null));
        console.log("connected to socket server.");
    });

    socket.on(SocketEvent.CONNECT_ERROR, (error) => {
        store.dispatch(LOGIN_ERROR('Connection to socket server failed. ' + JSON.stringify(error)));
    });

    socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
        store.dispatch(LOGIN_ERROR('Connection to socket server timeout.'));
    });

    socket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
        window.localStorage.setItem('token', result.token);
        window.location.replace(result.redirectUrl);
    });

    socket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
        store.dispatch(LOGIN_ERROR(error));
    });
}
