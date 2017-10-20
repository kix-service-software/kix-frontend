import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (subject: string) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ subject });
    });

    return new StateAction(TicketCreationDialogAction.SUBJECT_CHANGED, payload);
};
