import { WidgetComponentState, Contact, AbstractAction } from "../../../../core/model";
import { ContactLabelProvider } from "../../../../core/browser/contact";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public contact: Contact = null,
        public labelProvider: ContactLabelProvider = new ContactLabelProvider(),
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
