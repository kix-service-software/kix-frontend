import { LoginSocketListener } from './../../socket/LoginSocketListener';
import { AuthenticationEvent, AuthenticationResult, SocketEvent, StateAction } from '@kix/core/dist/model/client';
import { LoginAction } from './LoginAction';
import LOGIN_ERROR from './login-error';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const loginSocketListener = new LoginSocketListener();
        resolve({ loginSocketListener });
    });
    return new StateAction(LoginAction.LOGIN_INITIALIZE, payload);
};
