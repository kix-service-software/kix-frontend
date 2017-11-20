import { StateAction } from '@kix/core/dist/browser/StateAction';
import { Action } from './';

export default () => {
    const payload = new Promise((resolve, reject) => {
        resolve({});
    });
    return new StateAction(Action.ACTION_FINISHED, payload);
};
