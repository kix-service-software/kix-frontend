import { SearchSocketListener } from './../../socket/SocketListener';
import { SocketEvent } from '@kix/core/dist/model';
import { SearchAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new SearchSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(SearchAction.SEARCH_INITIALIZE, payload);
};
