import { StateAction, WidgetConfiguration } from '@kix/core/dist/model/client';
import { WidgetAction } from './WidgetAction';

export default (widgetConfiguration: WidgetConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ widgetConfiguration });
    });

    return new StateAction(WidgetAction.WIDGET_LOADED, payload);
};
