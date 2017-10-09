import { StateAction, ContainerConfiguration } from '@kix/core/dist/model/client';
import { ReportsAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(ReportsAction.REPORTS_CONTAINER_CONFIGURATION_LOADED, payload);
};
