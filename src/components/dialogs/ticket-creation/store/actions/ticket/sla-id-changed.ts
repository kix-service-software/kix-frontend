import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (slaId: number) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ slaId: null });
    });

    return new StateAction(TicketCreationDialogAction.SLA_ID_CHANGED, payload);
};
