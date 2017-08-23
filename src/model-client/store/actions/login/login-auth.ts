import {
    LoginRequest,
    UserType,
    LoginState,
    AuthenticationEvent,
    AuthenticationResult
} from './../../../authentication/';

export default (userName: string, password: string) => {
    return {
        type: 'LOGIN_AUTH',
        payload: new Promise((resolve, reject) => {
            resolve(doLogin(userName, password));
        })
    };
};

function doLogin(userName: string, password: string): any {
    const store = require('../../');
    const loginState: LoginState = store.getState().login;

    loginState.socket.emit(AuthenticationEvent.LOGIN,
        new LoginRequest(userName, password, UserType.AGENT));

    return {
        userName,
        password,
        doLogin: true
    };
}
