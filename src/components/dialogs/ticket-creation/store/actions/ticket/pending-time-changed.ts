import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (pendingTime: string) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ pendingTime: null });
    });

    return new StateAction(TicketCreationDialogAction.PENDING_TIME_CHANGED, payload);
};
