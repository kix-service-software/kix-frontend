import { ContainerConfiguration, WidgetTemplate } from '@kix/core/dist/model/client';
import { TicketsSocketListener } from './../socket/TicketSocketListener';

export class TicketsState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: TicketsSocketListener = null;

    public widgetTemplates: WidgetTemplate[] = [];

}
