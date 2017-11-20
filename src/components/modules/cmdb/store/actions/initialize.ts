import { CMDBSocketListener } from './../../socket/SocketListener';
import { SocketEvent } from '@kix/core/dist/model';
import { CMDBAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new CMDBSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(CMDBAction.CMDB_INITIALIZE, payload);
};
