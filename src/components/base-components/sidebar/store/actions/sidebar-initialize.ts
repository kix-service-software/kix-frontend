import { SidebarSocketListener } from '../../socket/SidebarSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { SidebarAction } from './';

export default (store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new SidebarSocketListener(store);
        resolve({ socketListener });
    });
    return new StateAction(SidebarAction.SIDEBAR_INITIALIZE, payload);
};
