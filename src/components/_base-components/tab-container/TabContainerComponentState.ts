import { ConfiguredWidget } from "@kix/core/dist/model";

export class TabContainerComponentState {

    public constructor(
        public activeTab: ConfiguredWidget = null,
        public tabWidgets: ConfiguredWidget[] = [],
        public title: string = "",
        public minimizable: boolean = true
    ) { }

}
