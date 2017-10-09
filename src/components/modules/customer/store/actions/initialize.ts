import { ServicesSocketListener } from './../../socket/SocketListener';
import { StateAction, SocketEvent } from '@kix/core/dist/model/client';
import { CustomerAction } from './';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new ServicesSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(CustomerAction.CUSTOMER_INITIALIZE, payload);
};
