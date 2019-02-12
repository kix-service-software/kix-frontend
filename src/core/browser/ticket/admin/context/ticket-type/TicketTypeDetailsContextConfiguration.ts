import { ContextConfiguration, ConfiguredWidget } from "../../../../../model";

export class TicketTypeDetailsContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorer: string[],
        public explorerWidgets: ConfiguredWidget[],
        public lanes: string[],
        public laneWidgets: ConfiguredWidget[],
        public laneTabs: string[],
        public laneTabWidgets: ConfiguredWidget[],
        public content: string[],
        public contentWidgets: ConfiguredWidget[],
        public generalActions: string[] = [],
        public actions: string[] = [],
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, []);
    }

}
