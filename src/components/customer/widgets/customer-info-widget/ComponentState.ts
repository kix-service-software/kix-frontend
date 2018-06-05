import { WidgetComponentState, Customer, AbstractAction } from "@kix/core/dist/model";
import { CustomerLabelProvider } from "@kix/core/dist/browser/customer";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public customer: Customer = null,
        public labelProvider: CustomerLabelProvider = new CustomerLabelProvider(),
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
