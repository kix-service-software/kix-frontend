import { StateAction } from '@kix/core/dist/model/client';

import { TicketListSocketListener } from '../../socket/TicketListSocketListener';
import { TicketListAction } from './TicketListAction';

export default (store: any, limit: number, properties: string[]) => {

    const payload = new Promise(async (resolve, reject) => {
        const socketListener: TicketListSocketListener = store.getState().socketListener;
        const tickets = await socketListener.loadTickets(limit, properties);
        resolve({ tickets });
    });

    return new StateAction(TicketListAction.LOAD_TICKETS, payload);
};
