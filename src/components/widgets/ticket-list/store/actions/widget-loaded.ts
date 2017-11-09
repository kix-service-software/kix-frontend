import { StateAction } from '@kix/core/dist/model/client';

import { TicketListSocketListener } from '../../socket/TicketListSocketListener';
import { TicketListAction } from './';

export default (configuration: any) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(TicketListAction.CONFIGURATION_LOADED, payload);
};
