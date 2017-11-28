import { CustomerAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (rows: string[][]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ rows });
    });

    return new StateAction(CustomerAction.CUSTOMER_CONTAINER_CONFIGURATION_LOADED, payload);
};
