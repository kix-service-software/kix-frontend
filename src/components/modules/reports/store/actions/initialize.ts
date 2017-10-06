import { ReportsSocketListener } from './../../socket/SocketListener';
import { StateAction, SocketEvent } from '@kix/core/dist/model/client';
import { ReportsAction } from './';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new ReportsSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(ReportsAction.REPORTS_INITIALIZE, payload);
};
