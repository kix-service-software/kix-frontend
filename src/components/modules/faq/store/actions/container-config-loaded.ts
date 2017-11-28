import { FAQAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (rows: string[][]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ rows });
    });

    // TODO: wenn's nicht wegfliegt, noch umbennenen (container_configuration gibs nicht mehr)
    return new StateAction(FAQAction.FAQ_CONTAINER_CONFIGURATION_LOADED, payload);
};
