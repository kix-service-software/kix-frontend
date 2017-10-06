import { StateAction, ContainerConfiguration } from '@kix/core/dist/model/client';
import { FAQAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(FAQAction.FAQ_CONTAINER_CONFIGURATION_LOADED, payload);
};
