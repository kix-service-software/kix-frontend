import { ConfiguredWidget, WidgetTemplate } from '@kix/core/dist/model';

export class DashboardComponentState {

    public rows: string[][] = [];

    public configuredWidgets: ConfiguredWidget[] = [];

    public widgetTemplates: WidgetTemplate[] = [];

    public configurationMode: boolean = false;

}
