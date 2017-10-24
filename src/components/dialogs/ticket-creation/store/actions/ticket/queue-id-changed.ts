import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (queueId: number) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ queueId: 1 });
    });

    return new StateAction(TicketCreationDialogAction.QUEUE_ID_CHANGED, payload);
};
