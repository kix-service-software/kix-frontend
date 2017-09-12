import { ContainerConfiguration } from './../../../../model/client/components/';
import { StateAction } from '../../../../model/client/store/StateAction';
import { DashboardAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(DashboardAction.DASHBOARD_CONTAINER_CONFIGURATION_LOADED, payload);
};
