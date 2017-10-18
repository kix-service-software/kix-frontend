import { StateAction, PersonalSettings, CreationDialog } from '@kix/core/dist/model/client';
import { CreationDialogAction } from './CreationDialogAction';

export default (creationDialogs: CreationDialog[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ creationDialogs });
    });

    return new StateAction(CreationDialogAction.CREATION_DIALOG_LOADED, payload);
};
