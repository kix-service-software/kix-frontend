import { StateAction } from '@kix/core/dist/model/client';

import { TicketListSocketListener } from '../../socket/TicketListSocketListener';
import { TicketListAction } from './';

export default (store: any, widgetId: string, instanceId: string) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new TicketListSocketListener(store, widgetId, instanceId);
        resolve({ socketListener });
    });
    return new StateAction(TicketListAction.TICKET_LIST_INITIALIZE, payload);
};
