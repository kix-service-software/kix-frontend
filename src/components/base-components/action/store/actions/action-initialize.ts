import { Action } from './Action';
import { ActionSocketListener } from './../../socket/ActionSocketListener';
import { StateAction } from '@kix/core';

export default (store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new ActionSocketListener(store);
        resolve({ socketListener });
    });
    return new StateAction(Action.ACTION_INITIALIZE, payload);
};
