import { SearchSocketListener } from './../../socket/SocketListener';
import { StateAction, SocketEvent } from '@kix/core/dist/model/client';
import { SearchAction } from './';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new SearchSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(SearchAction.SEARCH_INITIALIZE, payload);
};
