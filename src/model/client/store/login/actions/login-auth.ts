import { StateAction } from './../../StateAction';
import { LoginAction } from './LoginAction';
import { LoginState } from '../index';
import { UserType } from '../../../index';

export default (userName: string, password: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve(doLogin(userName, password));
    });
    return new StateAction(LoginAction.LOGIN_AUTH, payload);
};

function doLogin(userName: string, password: string): any {
    const store = require('../');
    const loginState: LoginState = store.getState();

    loginState.socketListener.login(userName, password, UserType.AGENT);

    return { userName, password };
}
