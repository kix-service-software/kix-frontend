import { StateAction, SidebarConfiguration, WidgetTemplate } from '@kix/core/dist/model/client';
import { SidebarAction } from './';

export default (configuration: SidebarConfiguration, widgetTemplates: WidgetTemplate[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration, widgetTemplates });
    });

    return new StateAction(SidebarAction.SIDEBAR_CONFIGURATION_LOADED, payload);
};
