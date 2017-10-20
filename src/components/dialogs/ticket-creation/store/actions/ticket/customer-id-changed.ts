import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (customerId: number) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ customerId });
    });

    return new StateAction(TicketCreationDialogAction.CUSTOMER_ID_CHANGED, payload);
};
