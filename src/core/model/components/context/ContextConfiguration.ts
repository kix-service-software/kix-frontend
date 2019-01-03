import { ConfiguredWidget, WidgetDescriptor } from "..";

export abstract class ContextConfiguration {

    public constructor(
        public contextId: string,
        public explorer: string[],
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorerWidgets: ConfiguredWidget[],
        public overlayWidgets: ConfiguredWidget[]
    ) { }

}
