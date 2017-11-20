import { PersonalSettings, CreationDialog } from '@kix/core/dist/model';
import { CreationDialogAction } from './CreationDialogAction';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (creationDialogs: CreationDialog[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ creationDialogs });
    });

    return new StateAction(CreationDialogAction.CREATION_DIALOG_LOADED, payload);
};
