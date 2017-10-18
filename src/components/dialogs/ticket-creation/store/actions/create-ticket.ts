import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({});
        }, 3500);
    });

    return new StateAction(TicketCreationDialogAction.CREATE_TICKET, payload);
};
