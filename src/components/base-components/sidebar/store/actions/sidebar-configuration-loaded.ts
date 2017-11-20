import { SidebarConfiguration, WidgetTemplate } from '@kix/core/dist/model';
import { StateAction } from '@kix/core/dist/browser/StateAction';
import { SidebarAction } from './';

export default (configuration: SidebarConfiguration, widgetTemplates: WidgetTemplate[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration, widgetTemplates });
    });

    return new StateAction(SidebarAction.SIDEBAR_CONFIGURATION_LOADED, payload);
};
