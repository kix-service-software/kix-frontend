import { ContainerConfiguration } from '@kix/core/dist/model';
import { CustomerAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(CustomerAction.CUSTOMER_CONTAINER_CONFIGURATION_LOADED, payload);
};
