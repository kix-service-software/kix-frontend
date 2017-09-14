import { StateAction } from '../../../../../model/client/store/StateAction';
import { DeleteAction } from './';

declare var io: any;

export default (error: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ error });
    });
    return new StateAction(DeleteAction.DELETE_ACTION_ERROR, payload);
};
