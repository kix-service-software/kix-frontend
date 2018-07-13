import { ObjectData, AbstractAction } from "@kix/core/dist/model";

export class ComponentState {

    public initialized: boolean = false;

    public constructor(
        public contextId: string,
        public objectData: ObjectData,
        public objectId: string,
        public gridColumns: string = null,
        public hasExplorer: boolean = false
    ) { }

}
