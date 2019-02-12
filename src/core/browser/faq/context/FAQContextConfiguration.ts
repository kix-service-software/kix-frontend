import { ConfiguredWidget, ContextConfiguration } from "../../../model";

export class FAQContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public explorer: string[],
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorerWidgets: ConfiguredWidget[],
        public content: string[],
        public contentWidgets: ConfiguredWidget[],
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, []);
    }
}
