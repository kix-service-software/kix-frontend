import { StateAction } from '@kix/core/dist/model/client';
import { Action } from './';

export default () => {
    const payload = new Promise((resolve, reject) => {
        resolve({});
    });
    return new StateAction(Action.ACTION_FINISHED, payload);
};
