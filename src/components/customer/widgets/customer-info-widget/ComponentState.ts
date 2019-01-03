import { WidgetComponentState, Customer, AbstractAction } from "../../../../core/model";
import { CustomerLabelProvider } from "../../../../core/browser/customer";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public customer: Customer = null,
        public labelProvider: CustomerLabelProvider = new CustomerLabelProvider(),
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
