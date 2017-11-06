import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (priorityId: number) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ priorityId });
    });

    return new StateAction(TicketCreationDialogAction.PRIORITY_ID_CHANGED, payload);
};
