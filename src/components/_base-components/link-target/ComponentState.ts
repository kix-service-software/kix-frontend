import { ContextMode, KIXObjectType } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public contextId: string = null,
        public objectType: KIXObjectType = null,
        public contextMode: ContextMode = null,
        public objectId: string | number = null,
        public url: string = null,
        public loading: boolean = false
    ) { }

}
