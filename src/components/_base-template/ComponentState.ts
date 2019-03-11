import { ObjectData } from "../../core/model";

export class ComponentState {

    public constructor(
        public contextId: string,
        public objectData: ObjectData,
        public objectId: string,
        public gridColumns: string = null,
        public hasExplorer: boolean = false,
        public showSidebar: boolean = false,
        public loading: boolean = true,
        public loadingHint: string = 'Loading ...',
        public reload: boolean = false,
        public initialized: boolean = false,
        public moduleTemplates: any[] = []
    ) { }

}
