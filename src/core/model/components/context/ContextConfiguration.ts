import { ConfiguredWidget } from "..";

export class ContextConfiguration {

    public constructor(
        public contextId: string,
        public sidebars: string[] = [],
        public sidebarWidgets: ConfiguredWidget[] = [],
        public explorer: string[] = [],
        public explorerWidgets: ConfiguredWidget[] = [],
        public lanes: string[] = [],
        public laneWidgets: ConfiguredWidget[] = [],
        public content: string[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public generalActions: string[] = [],
        public actions: string[] = [],
        public overlayWidgets: ConfiguredWidget[] = []
    ) { }

}
