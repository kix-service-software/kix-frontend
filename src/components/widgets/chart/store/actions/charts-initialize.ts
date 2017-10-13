import { ChartSocketListener } from './../../socket/ChartSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { ChartAction } from './ChartAction';

export default (store: any, widgetId: string, instanceId: string) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new ChartSocketListener(store, widgetId, instanceId);
        resolve({ socketListener });
    });
    return new StateAction(ChartAction.CHART_INITIALIZE, payload);
};
