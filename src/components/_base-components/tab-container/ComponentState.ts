import { ConfiguredWidget, ContextType, IAction } from "../../../core/model";
import { AbstractComponentState } from "../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public tabWidgets: ConfiguredWidget[] = [],
        public tabId: string = null,
        public activeTab: ConfiguredWidget = null,
        public title: string = "",
        public minimizable: boolean = true,
        public hasSidebars: boolean = false,
        public contextType: ContextType = null,
        public showSidebar: boolean = true,
        public contentActions: IAction[] = []
    ) {
        super();
    }

}
