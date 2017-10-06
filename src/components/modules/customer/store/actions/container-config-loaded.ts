import { StateAction, ContainerConfiguration } from '@kix/core/dist/model/client';
import { CustomerAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(CustomerAction.CUSTOMER_CONTAINER_CONFIGURATION_LOADED, payload);
};
