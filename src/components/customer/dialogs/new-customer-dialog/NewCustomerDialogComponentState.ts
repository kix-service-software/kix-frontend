import { KIXObjectType } from "@kix/core/dist/model";

export class NewCustomerDialogComponentState {

    public constructor(
        public loading: boolean = false,
        public formId: string = 'new-customer-form'
    ) { }

}
