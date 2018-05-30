import { KIXObjectType } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public formId: string = 'new-contact-form'
    ) { }

}
