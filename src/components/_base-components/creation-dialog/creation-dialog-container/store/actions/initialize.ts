import { CreationDialogSocketListener } from './../../socket/CreationDialogSocketListener';
import { StateAction } from '@kix/core/dist/browser/StateAction';
import { CreationDialogAction } from './CreationDialogAction';

export default (store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new CreationDialogSocketListener(store);
        resolve({ socketListener });
    });
    return new StateAction(CreationDialogAction.CREATION_DIALOG_INITIALIZE, payload);
};
