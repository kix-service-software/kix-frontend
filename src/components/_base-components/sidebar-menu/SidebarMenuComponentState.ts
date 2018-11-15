import { ConfiguredWidget, ContextType } from "@kix/core/dist/model";

export class SidebarMenuComponentState {

    public constructor(
        public sidebars: ConfiguredWidget[] = [],
        public contextType: ContextType = null
    ) { }

}
