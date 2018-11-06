import { ConfiguredWidget, ContextType } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public explorer: ConfiguredWidget[] = [],
        public contextType: ContextType = null,
        public isExplorerBarExpanded: boolean = true,
        public explorerStructurString: string = null,
        public explorerStructurStringLastElement: string = null
    ) { }
}
