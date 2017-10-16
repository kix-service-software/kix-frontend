import { ContainerConfiguration, WidgetTemplate } from '@kix/core/dist/model/client';
import { DashboardSocketListener } from './../socket/DashboardSocketListener';

export class DashboardState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: DashboardSocketListener = null;

    public widgetTemplates: WidgetTemplate[] = [];

}
