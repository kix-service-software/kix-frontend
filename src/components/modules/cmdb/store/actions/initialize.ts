import { CMDBSocketListener } from './../../socket/SocketListener';
import { StateAction, SocketEvent } from '@kix/core/dist/model/client';
import { CMDBAction } from './';

declare var io: any;

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new CMDBSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(CMDBAction.CMDB_INITIALIZE, payload);
};
