import { StateAction, ContainerConfiguration, WidgetTemplate } from '@kix/core/dist/model/client';
import { TicketAction } from './';

export default (containerConfiguration: ContainerConfiguration, widgetTemplates: WidgetTemplate[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration, widgetTemplates });
    });

    return new StateAction(TicketAction.TICKET_CONTAINER_CONFIGURATION_LOADED, payload);
};
