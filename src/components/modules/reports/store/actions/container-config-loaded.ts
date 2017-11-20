import { ContainerConfiguration } from '@kix/core/dist/model';
import { ReportsAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(ReportsAction.REPORTS_CONTAINER_CONFIGURATION_LOADED, payload);
};
