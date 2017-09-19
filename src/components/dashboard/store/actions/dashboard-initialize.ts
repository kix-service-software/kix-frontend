import { DashboardSocketListener } from './../../socket/DashboardSocketListener';
import { StateAction, SocketEvent } from '@kix/core';
import { DashboardAction } from './';

declare var io: any;

export default () => {
    const payload = new Promise((resolve, reject) => {
        const dashboardSocketListener = new DashboardSocketListener();
        resolve({ dashboardSocketListener });
    });
    return new StateAction(DashboardAction.DASHBOARD_INITIALIZE, payload);
};
