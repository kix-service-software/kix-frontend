import { Customer } from "@kix/core/dist/model";
import { CustomerLabelProvider } from "@kix/core/dist/browser/customer";

export class ComponentState {

    public constructor(
        public customer: Customer = null,
        public customerId: string = null,
        public labelProvider: CustomerLabelProvider = new CustomerLabelProvider(),
        public error: any = null,
        public info: Array<[string, Array<[string, string]>]> = [],
        public groups: string[] = null
    ) { }

}
