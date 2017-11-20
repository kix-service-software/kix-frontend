import { ContainerConfiguration, WidgetTemplate } from '@kix/core/dist/model';

export class TicketsComponentState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public configurationMode: boolean = false;

    public widgetTemplates: WidgetTemplate[] = [];

}
