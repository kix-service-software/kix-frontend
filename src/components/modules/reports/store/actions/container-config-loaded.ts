import { ReportsAction } from './';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (rows: string[][]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ rows });
    });

    return new StateAction(ReportsAction.REPORTS_CONTAINER_CONFIGURATION_LOADED, payload);
};
