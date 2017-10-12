import { StateAction } from '@kix/core/dist/model/client';
import { WidgetSocketListener } from '../../socket/WidgetSocketListener';
import { WidgetAction } from './';

export default (widgetId: string, instanceId: string, store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new WidgetSocketListener(widgetId, instanceId, store);
        resolve({ socketListener });
    });
    return new StateAction(WidgetAction.WIDGET_INITIALIZE, payload);
};
