import { StateAction } from '@kix/core';
import { SidebarSocketListener } from '../../socket/SidebarSocketListener';
import { SidebarAction } from './';

declare var io: any;

export default (sidebarId: string, store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new SidebarSocketListener(sidebarId, store);
        resolve({ socketListener });
    });
    return new StateAction(SidebarAction.SIDEBAR_INITIALIZE, payload);
};
