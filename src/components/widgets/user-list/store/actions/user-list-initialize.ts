import { StateAction } from '../../../../../model/client/store/StateAction';
import { UserListSocketListener } from '../../socket/UserListSocketListener';
import { UserListAction } from './';

declare var io: any;

export default (frontendSocketUrl: string) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new UserListSocketListener(frontendSocketUrl);
        resolve({ socketListener });
    });
    return new StateAction(UserListAction.USER_LIST_INITIALIZE, payload);
};
