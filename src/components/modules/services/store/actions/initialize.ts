import { ServicesSocketListener } from './../../socket/SocketListener';
import { SocketEvent } from '@kix/core/dist/model';
import { ServicesAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new ServicesSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(ServicesAction.SERVICES_INITIALIZE, payload);
};
