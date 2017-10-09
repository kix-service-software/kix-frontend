import { StateAction, ContainerConfiguration } from '@kix/core/dist/model/client';
import { SearchAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(SearchAction.SEARCH_CONTAINER_CONFIGURATION_LOADED, payload);
};
