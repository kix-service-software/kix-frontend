import { FAQSocketListener } from './../../socket/SocketListener';
import { StateAction, SocketEvent } from '@kix/core/dist/model/client';
import { FAQAction } from './';

declare var io: any;

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new FAQSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(FAQAction.FAQ_INITIALIZE, payload);
};
