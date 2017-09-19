import { StateAction } from '@kix/core';
import { SidebarAction } from './';

declare var io: any;

export default (error: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ error });
    });
    return new StateAction(SidebarAction.SIDEBAR_ERROR, payload);
};
