import { ContextConfiguration, ConfiguredWidget } from "../../../model";

export class TicketListContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorer: string[],
        public explorerWidgets: ConfiguredWidget[],
        public content: string[],
        public contentWidgets: ConfiguredWidget[],
        public overlayWidgets: ConfiguredWidget[]
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, overlayWidgets);
    }

}
