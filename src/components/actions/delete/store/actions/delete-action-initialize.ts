import { DeleteAction } from './DeleteAction';
import { DeleteActionSocketListener } from './../../socket/DeleteActionSocketListener';
import { StateAction } from '../../../../../model/client/store/StateAction';

declare var io: any;

export default (store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new DeleteActionSocketListener(store);
        resolve({ socketListener });
    });
    return new StateAction(DeleteAction.DELETE_ACTION_INITIALIZE, payload);
};
