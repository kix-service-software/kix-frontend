import { ServicesSocketListener } from './../../socket/SocketListener';
import { SocketEvent } from '@kix/core/dist/model';
import { CustomerAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new ServicesSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(CustomerAction.CUSTOMER_INITIALIZE, payload);
};
