import { StateAction, ContainerConfiguration, WidgetTemplate } from '@kix/core/dist/model/client';
import { DashboardAction } from './';

export default (containerConfiguration: ContainerConfiguration, widgetTemplates: WidgetTemplate[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration, widgetTemplates });
    });

    return new StateAction(DashboardAction.DASHBOARD_CONTAINER_CONFIGURATION_LOADED, payload);
};
