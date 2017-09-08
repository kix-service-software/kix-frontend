import { StateAction } from '../../../../../model/client/store/StateAction';
import { WidgetAction } from './';

declare var io: any;

export default (error: string) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ error });
    });
    return new StateAction(WidgetAction.WIDGET_ERROR, payload);
};
