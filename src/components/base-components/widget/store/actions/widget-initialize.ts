import { StateAction } from '../../../../../model/client/store/StateAction';
import { WidgetSocketListener } from '../../socket/WidgetSocketListener';
import { WidgetAction } from './';

declare var io: any;

export default (frontendSocketUrl: string, moduleId: string, widgetId: string, store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new WidgetSocketListener(frontendSocketUrl, moduleId, widgetId, store);
        resolve({ socketListener });
    });
    return new StateAction(WidgetAction.WIDGET_INITIALIZE, payload);
};
