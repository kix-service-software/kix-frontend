import { ContextConfiguration, ConfiguredWidget } from "../../../model";

export class CustomerDetailsContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public explorer: string[],
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorerWidgets: ConfiguredWidget[],
        public lanes: string[],
        public laneTabs: string[],
        public laneWidgets: ConfiguredWidget[],
        public laneTabWidgets: ConfiguredWidget[],
        public generalActions: string[] = [],
        public customerActions: string[] = [],
        public groupWidgets: ConfiguredWidget[],
        public overlayWidgets: ConfiguredWidget[]
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, overlayWidgets);
    }

}
