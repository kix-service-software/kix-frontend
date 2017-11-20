import { LoginSocketListener } from './../../socket/LoginSocketListener';
import { AuthenticationEvent, AuthenticationResult, SocketEvent } from '@kix/core/dist/model';
import { LoginAction } from './LoginAction';
import LOGIN_ERROR from './login-error';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const loginSocketListener = new LoginSocketListener();
        resolve({ loginSocketListener });
    });
    return new StateAction(LoginAction.LOGIN_INITIALIZE, payload);
};
