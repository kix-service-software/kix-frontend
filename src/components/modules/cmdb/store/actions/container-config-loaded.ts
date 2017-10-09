import { StateAction, ContainerConfiguration } from '@kix/core/dist/model/client';
import { CMDBAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(CMDBAction.CMDB_CONTAINER_CONFIGURATION_LOADED, payload);
};
