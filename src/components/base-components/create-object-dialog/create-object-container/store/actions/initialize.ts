import { CreateDialogSocketListener } from './../../socket/CreateDialogSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { CreateDialogAction } from './CreateDialogAction';

export default (store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new CreateDialogSocketListener(store);
        resolve({ socketListener });
    });
    return new StateAction(CreateDialogAction.CREATE_DIALOG_INITIALIZE, payload);
};
