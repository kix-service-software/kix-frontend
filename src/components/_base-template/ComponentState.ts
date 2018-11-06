import { ObjectData, AbstractAction } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public contextId: string,
        public objectData: ObjectData,
        public objectId: string,
        public gridColumns: string = null,
        public hasExplorer: boolean = false,
        public showSidebar: boolean = false,
        public loading: boolean = true,
        public loadingHint: string = 'Lade KIX ...',
        public initialized: boolean = false
    ) { }

}
