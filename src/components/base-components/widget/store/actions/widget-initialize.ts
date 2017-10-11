import { StateAction, WidgetType } from '@kix/core/dist/model/client';
import { WidgetSocketListener } from '../../socket/WidgetSocketListener';
import { WidgetAction } from './';

export default (widgetId: string, instanceId: string, widgetType: WidgetType, store: any) => {
    console.log(widgetType);
    const payload = new Promise((resolve, reject) => {
        const socketListener = new WidgetSocketListener(widgetId, instanceId, widgetType, store);
        resolve({ socketListener });
    });
    return new StateAction(WidgetAction.WIDGET_INITIALIZE, payload);
};
