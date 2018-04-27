import { ObjectData, AbstractAction } from "@kix/core/dist/model";

export class BaseTemplateComponentState {

    public initialized: boolean = false;

    public constructor(
        public contextId: string,
        public objectData: ObjectData,
        public objectId: string,
        public configurationMode: boolean = false,
        public gridColumns: string = null,
        public hasExplorer: boolean = false
    ) { }

}
