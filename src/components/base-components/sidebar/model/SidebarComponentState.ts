import { SidebarConfiguration, WidgetTemplate } from '@kix/core/dist/model/client';

export class SidebarComponentState {

    public configuration: SidebarConfiguration = null;
    public configurationMode: boolean = false;
    public widgetTemplates: WidgetTemplate[] = [];
}
