import { FAQSocketListener } from './../../socket/SocketListener';
import { SocketEvent } from '@kix/core/dist/model';
import { FAQAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new FAQSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(FAQAction.FAQ_INITIALIZE, payload);
};
