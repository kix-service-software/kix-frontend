import { ContainerConfiguration, WidgetTemplate } from '@kix/core/dist/model/client';

export class DashboardComponentState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public widgetTemplates: WidgetTemplate[] = [];

    public configurationMode: boolean = false;

}
