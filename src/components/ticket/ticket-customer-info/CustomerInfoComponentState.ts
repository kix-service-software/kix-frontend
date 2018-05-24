import { ContextType, Customer } from "@kix/core/dist/model";

export class CustomerInfoComponentState {

    public constructor(
        public contextType: ContextType = null,
        public customer: Customer = null
    ) { }

}
