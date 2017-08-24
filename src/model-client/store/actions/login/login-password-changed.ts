import { StateAction } from './../StateAction';
import { LoginAction } from './LoginAction';

export default (password: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ password });
    });
    return new StateAction(LoginAction.LOGIN_PASSWORD_CHANGED, payload);
};
