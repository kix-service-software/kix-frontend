import { StateAction } from '@kix/core/dist/model/client';
import { UserListSocketListener } from '../../socket/UserListSocketListener';
import { UserListAction } from './';

export default (store: any, widgetId: string, instanceId: string) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new UserListSocketListener(store, widgetId, instanceId);
        resolve({ socketListener });
    });
    return new StateAction(UserListAction.USER_LIST_INITIALIZE, payload);
};
