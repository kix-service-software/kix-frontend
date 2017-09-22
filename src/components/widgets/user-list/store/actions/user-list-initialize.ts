import { StateAction } from '@kix/core/dist/model/client';
import { UserListSocketListener } from '../../socket/UserListSocketListener';
import { UserListAction } from './';

declare var io: any;

export default (store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new UserListSocketListener(store);
        resolve({ socketListener });
    });
    return new StateAction(UserListAction.USER_LIST_INITIALIZE, payload);
};
