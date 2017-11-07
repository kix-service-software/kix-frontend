import { StateAction } from '@kix/core/dist/model/client';

import { TicketListAction } from './TicketListAction';

export default (error: any) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ error });
    });

    return new StateAction(TicketListAction.ERROR, payload);
};
