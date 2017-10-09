import { StateAction, ContainerConfiguration } from '@kix/core/dist/model/client';
import { ServicesAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(ServicesAction.SERVICES_CONTAINER_CONFIGURATION_LOADED, payload);
};
