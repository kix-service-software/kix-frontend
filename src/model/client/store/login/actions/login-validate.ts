import { StateAction } from './../../StateAction';
import { LoginAction } from './LoginAction';

export default (userName: string, password: string) => {
    const payload = new Promise((resolve, reject) => {
        const valid = isDefined(userName) && isDefined(password);
        resolve({ valid });
    });

    return new StateAction(LoginAction.LOGIN_VALIDATE, payload);
};

function isDefined(value: string): boolean {
    return (value !== undefined && value !== null && value !== "");
}
