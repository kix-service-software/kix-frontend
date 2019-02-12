import { ConfiguredWidget, ContextType } from "../../../core/model";

export class SidebarMenuComponentState {

    public constructor(
        public sidebars: ConfiguredWidget[] = [],
        public contextType: ContextType = null
    ) { }

}
