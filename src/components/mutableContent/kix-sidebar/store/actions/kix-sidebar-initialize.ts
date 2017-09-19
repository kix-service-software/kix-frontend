import { KixSidebarSocketListener } from '../../socket/KixSidebarSocketListener';
import { StateAction } from '@kix/core';
import { KixSidebarAction } from './';

export default (store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new KixSidebarSocketListener(store);
        resolve({ socketListener });
    });
    return new StateAction(KixSidebarAction.KIX_SIDEBAR_INITIALIZE, payload);
};
