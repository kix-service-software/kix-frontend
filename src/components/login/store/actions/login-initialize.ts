import { LoginSocketListener } from './../../socket/LoginSocketListener';
import { StateAction } from '../../../../model/client/store/StateAction';
import { SocketEvent } from '../../../../model/client/socket/SocketEvent';
import { LoginAction } from './LoginAction';
import { AuthenticationEvent, AuthenticationResult } from '../../../../model/client/socket/login/';
import LOGIN_ERROR from './login-error';

export default (frontendSocketUrl: string) => {
    const payload = new Promise((resolve, reject) => {
        const loginSocketListener = new LoginSocketListener(frontendSocketUrl);
        resolve({ loginSocketListener });
    });
    return new StateAction(LoginAction.LOGIN_INITIALIZE, payload);
};
