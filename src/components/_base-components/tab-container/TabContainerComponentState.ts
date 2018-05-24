import { ConfiguredWidget, ContextType } from "@kix/core/dist/model";

export class TabContainerComponentState {

    public constructor(
        public tabWidgets: ConfiguredWidget[] = [],
        public activeTab: ConfiguredWidget = null,
        public title: string = "",
        public minimizable: boolean = true,
        public hasSidebars: boolean = false,
        public contextType: ContextType = null
    ) { }

}
