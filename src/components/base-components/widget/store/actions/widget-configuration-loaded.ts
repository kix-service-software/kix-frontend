import { LoadUsersResult } from './../../../../../model/client/socket/users/LoadUsersResult';
import { StateAction } from '../../../../../model/client/store/StateAction';
import { UsersEvent } from '../../../../../model/client/socket/users/';
import { WidgetAction } from './WidgetAction';

export default (configuration: any) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(WidgetAction.WIDGET_CONFIGURATION_LOADED, payload);
};
