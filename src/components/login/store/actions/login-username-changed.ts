import { StateAction } from '@kix/core/dist/model/client';
import { LoginAction } from './LoginAction';

export default (userName: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ userName });
    });

    return new StateAction(LoginAction.LOGIN_USERNAME_CHANGED, payload);
};
