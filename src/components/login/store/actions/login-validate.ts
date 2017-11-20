import { StateAction } from '@kix/core/dist/browser/StateAction';
import { LoginAction } from './LoginAction';

export default (userName: string, password: string) => {
    const payload = new Promise((resolve, reject) => {
        const valid = isDefined(userName) && isDefined(password);
        let error = null;
        if (!valid) {
            // TODO: use translation service
            error = "Kein Benutzername oder Passwort eingegeben.";
        }
        resolve({ valid, error });
    });

    return new StateAction(LoginAction.LOGIN_VALIDATE, payload);
};

function isDefined(value: string): boolean {
    return (value !== undefined && value !== null && value !== "");
}
