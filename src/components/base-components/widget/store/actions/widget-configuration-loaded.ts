import {
    UsersEvent,
    StateAction,
    LoadUsersResult,
    WidgetConfiguration
} from '@kix/core';
import { WidgetAction } from './WidgetAction';

export default (configuration: WidgetConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(WidgetAction.WIDGET_CONFIGURATION_LOADED, payload);
};
