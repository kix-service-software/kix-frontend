import { LoginSocketListener } from './../../../socket/login/LoginSocketListener';
import { StateAction } from './../../StateAction';
import { SocketEvent } from '../../../socket/SocketEvent';
import { LoginAction } from './LoginAction';
import { AuthenticationEvent, AuthenticationResult } from './../../../socket/login/';
import LOGIN_ERROR from './login-error';

export default (frontendSocketUrl: string) => {
    const payload = new Promise((resolve, reject) => {
        const loginSocketListener = new LoginSocketListener(frontendSocketUrl);
        resolve({ loginSocketListener });
    });
    return new StateAction(LoginAction.LOGIN_INITIALIZE, payload);
};
