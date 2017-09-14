import { StateAction } from '../../../../../model/client/store/StateAction';
import { DeleteAction } from './';

declare var io: any;

export default () => {
    const payload = new Promise((resolve, reject) => {
        resolve({});
    });
    return new StateAction(DeleteAction.DELETE_ACTION_FINISHED, payload);
};
