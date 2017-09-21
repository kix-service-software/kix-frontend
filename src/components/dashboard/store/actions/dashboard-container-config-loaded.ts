import { StateAction, ContainerConfiguration } from '@kix/core/dist/model/client';
import { DashboardAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(DashboardAction.DASHBOARD_CONTAINER_CONFIGURATION_LOADED, payload);
};
