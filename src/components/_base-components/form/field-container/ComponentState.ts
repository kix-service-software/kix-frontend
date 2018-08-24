import { KIXObjectType } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public objectType: KIXObjectType = null,
        public formId: string = null,
        public minimized: boolean = false,
        public level: number = 0
    ) { }

}
