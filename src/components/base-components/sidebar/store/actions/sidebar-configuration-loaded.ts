import { LoadUsersResult } from './../../../../../model/client/socket/users/LoadUsersResult';
import { StateAction } from '../../../../../model/client/store/StateAction';
import { UsersEvent } from '../../../../../model/client/socket/users/';
import { SidebarAction } from './SidebarAction';

export default (configuration: any) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(SidebarAction.SIDEBAR_CONFIGURATION_LOADED, payload);
};
