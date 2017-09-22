import {
    UsersEvent,
    StateAction,
    LoadUsersResult,
    WidgetConfiguration
} from '@kix/core/dist/model/client';
import { WidgetAction } from './WidgetAction';

export default (configuration: WidgetConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(WidgetAction.WIDGET_CONFIGURATION_LOADED, payload);
};
