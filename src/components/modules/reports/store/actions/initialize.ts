import { ReportsSocketListener } from './../../socket/SocketListener';
import { SocketEvent } from '@kix/core/dist/model';
import { ReportsAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new ReportsSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(ReportsAction.REPORTS_INITIALIZE, payload);
};
