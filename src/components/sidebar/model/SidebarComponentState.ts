import { ConfiguredWidget, WidgetTemplate } from '@kix/core/dist/model';

export class SidebarComponentState {

    public configuredWidgets: ConfiguredWidget[] = [];
    public showIconBar: boolean = true;
    public rows: string[] = [];
    public context: string = "dashboard";
    public sidebarBarExpanded: boolean = false;

}
