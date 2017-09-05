import { ContainerConfiguration } from './../../../components/dragable-container/ContainerConfiguration';
import { MenuEntry } from './../../../components/main-menu/MenuEntry';
import { StateAction } from './../../StateAction';
import { DashboardAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(DashboardAction.DASHBOARD_CONTAINER_CONFIGURATION_LOADED, payload);
};
