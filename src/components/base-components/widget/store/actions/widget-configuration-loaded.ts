import {
    UsersEvent,
    StateAction,
    LoadUsersResult,
    LoadWidgetResponse
} from '@kix/core/dist/model/client';
import { WidgetAction } from './WidgetAction';

export default (loadWidgetResponse: LoadWidgetResponse) => {
    const payload = new Promise((resolve, reject) => {
        resolve({
            configuration: loadWidgetResponse.configuration,
            template: loadWidgetResponse.templatePath,
            configurationTemplate: loadWidgetResponse.configurationTemplatePath
        });
    });

    return new StateAction(WidgetAction.WIDGET_LOADED, payload);
};
