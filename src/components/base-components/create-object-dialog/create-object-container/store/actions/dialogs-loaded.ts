import { StateAction, PersonalSettings, CreateDialog } from '@kix/core/dist/model/client';
import { CreateDialogAction } from './CreateDialogAction';

export default (createDialogs: CreateDialog[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ createDialogs });
    });

    return new StateAction(CreateDialogAction.CREATE_DIALOG_LOADED, payload);
};
