import { ContainerConfiguration, WidgetTemplate } from '@kix/core/dist/model';

export class DashboardComponentState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public widgetTemplates: WidgetTemplate[] = [];

    public configurationMode: boolean = false;

}
