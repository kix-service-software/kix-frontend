import { StateAction } from '@kix/core/dist/model/client';
import { SidebarAction } from './';

export default (configuration: any) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(SidebarAction.SIDEBAR_CONFIGURATION_LOADED, payload);
};
