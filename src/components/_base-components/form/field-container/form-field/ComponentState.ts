import { KIXObjectType, FormField } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public field: FormField = null,
        public formId: string = null,
        public minimized: boolean = false,
        public level: number = 0
    ) { }

}
