import { ContextType, Customer } from "@kix/core/dist/model";
import { CustomerLabelProvider } from "@kix/core/dist/browser/customer";

export class CustomerInfoComponentState {

    public constructor(
        public customer: Customer = null,
        public customerId: string = null,
        public labelProvider: CustomerLabelProvider = new CustomerLabelProvider(),
        public error: any = null
    ) { }

}
