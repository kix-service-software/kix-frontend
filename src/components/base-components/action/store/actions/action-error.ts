import { StateAction } from '../../../../../model/client/store/StateAction';
import { Action } from './';

export default (error: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ error });
    });
    return new StateAction(Action.ACTION_ERROR, payload);
};
