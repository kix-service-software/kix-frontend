import { ConfiguredWidget } from "@kix/core/dist/model";

export class TabContainerComponentState {

    public constructor(
        public tabWidgets: ConfiguredWidget[] = [],
        public activeTab: ConfiguredWidget = null,
        public title: string = "",
        public minimizable: boolean = true,
        public showSidebar: boolean = false,
        public hasSidebars: boolean = false
    ) { }

}
