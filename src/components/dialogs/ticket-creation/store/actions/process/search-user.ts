import { CreationTicketStore } from './../../index';
import { StateAction, User } from '@kix/core/dist/model/client';
import { TicketCreationProcessAction } from './TicketCreationProcessAction';

export default (value: string) => {

    const payload = new Promise(async (resolve, reject) => {
        const user = await CreationTicketStore.INSTANCE.getSocketListener().searchUser(value);
        resolve({ user });
    });

    return new StateAction(TicketCreationProcessAction.SEARCH_USER, payload);
};

