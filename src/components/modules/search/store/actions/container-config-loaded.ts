import { ContainerConfiguration } from '@kix/core/dist/model';
import { SearchAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(SearchAction.SEARCH_CONTAINER_CONFIGURATION_LOADED, payload);
};
