import { StateAction } from '../../../../../model/client/store/StateAction';
import { SidebarAction } from './SidebarAction';

export default (configuration: any) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(SidebarAction.SIDEBAR_CONFIGURATION_LOADED, payload);
};
