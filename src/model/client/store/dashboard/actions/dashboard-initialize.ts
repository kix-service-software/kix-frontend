import { DashboardSocketListener } from './../../../socket/dashboard/DashboardSocketListener';
import { StateAction } from './../../StateAction';
import { SocketEvent } from '../../../socket/SocketEvent';
import { DashboardAction } from './';

declare var io: any;

export default (frontendSocketUrl: string) => {
    const payload = new Promise((resolve, reject) => {
        const dashboardSocketListener = new DashboardSocketListener(frontendSocketUrl);
        resolve({ dashboardSocketListener });
    });
    return new StateAction(DashboardAction.DASHBOARD_INITIALIZE, payload);
};
