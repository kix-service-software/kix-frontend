import { StateAction, PersonalSettings, CreationDialog } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (customerId: number) => {
    const payload = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ customerId });
        }, 3000);
    });

    return new StateAction(TicketCreationDialogAction.CUSTOMER_ID_CHANGED, payload);
};
