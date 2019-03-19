import { Customer } from "../../../core/model";
import { CustomerLabelProvider } from "../../../core/browser/customer";

export class ComponentState {

    public constructor(
        public customer: Customer = null,
        public labelProvider: CustomerLabelProvider = new CustomerLabelProvider(),
        public error: any = null,
        public info: Array<[string, Array<[string, string]>]> = [],
    ) { }

}
