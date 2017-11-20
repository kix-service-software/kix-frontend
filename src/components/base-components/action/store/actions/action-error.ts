import { StateAction } from '@kix/core/dist/browser/StateAction';
import { Action } from './';

export default (error: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ error });
    });
    return new StateAction(Action.ACTION_ERROR, payload);
};
