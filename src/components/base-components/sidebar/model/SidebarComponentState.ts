import { ConfiguredWidget, WidgetTemplate } from '@kix/core/dist/model';

export class SidebarComponentState {

    public rows: string[][] = [];
    public configuredWidgets: ConfiguredWidget[] = [];
    public configurationMode: boolean = false;
    public widgetTemplates: WidgetTemplate[] = [];
    public showIconBar: boolean = true;
}
