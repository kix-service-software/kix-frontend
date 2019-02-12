import { ConfiguredWidget, ContextConfiguration } from "../../../model";

export class ConfigItemDetailsContextConfiguration extends ContextConfiguration {

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
        public actions: string[],
        public configItemActions: string[],
        public content: string[],
        public contentWidgets: ConfiguredWidget[]
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, []);
    }

}
