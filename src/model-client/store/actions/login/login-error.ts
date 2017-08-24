import { StateAction } from './../StateAction';
import { LoginAction } from './LoginAction';

export default (error: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ error });
    });

    return new StateAction(LoginAction.LOGIN_ERROR, payload);
};
