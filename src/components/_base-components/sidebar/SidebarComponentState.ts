import { ConfiguredWidget } from '@kix/core/dist/model';

export class SidebarComponentState {

    public sidebars: ConfiguredWidget[] = [];
    public showIconBar: boolean = true;
    public rows: string[] = [];
    public context: string = "dashboard";
    public sidebarBarExpanded: boolean = false;
    public showSidebar: boolean = false;

}
