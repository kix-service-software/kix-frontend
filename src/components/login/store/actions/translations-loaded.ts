import { StateAction } from '@kix/core/dist/model/client';
import { LoginAction } from './LoginAction';

export default (translations: any) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ translations });
    });
    return new StateAction(LoginAction.TRANSLATIONS_LOADED, payload);
};
