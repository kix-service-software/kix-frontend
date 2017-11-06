import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (serviceId: number) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ serviceId: null });
    });

    return new StateAction(TicketCreationDialogAction.SERVICE_ID_CHANGED, payload);
};
