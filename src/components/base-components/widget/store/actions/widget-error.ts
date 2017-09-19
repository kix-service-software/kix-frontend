import { StateAction } from '@kix/core/dist/model/client';
import { WidgetAction } from './';

export default (error: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ error });
    });
    return new StateAction(WidgetAction.WIDGET_ERROR, payload);
};
