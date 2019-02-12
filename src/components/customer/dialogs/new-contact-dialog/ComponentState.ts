import { KIXObjectType } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public formId: string = 'new-contact-form'
    ) { }

}
