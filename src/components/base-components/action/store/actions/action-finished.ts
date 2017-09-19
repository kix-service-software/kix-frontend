import { StateAction } from '../../../../../model/client/store/StateAction';
import { Action } from './';

export default () => {
    const payload = new Promise((resolve, reject) => {
        resolve({});
    });
    return new StateAction(Action.ACTION_FINISHED, payload);
};
