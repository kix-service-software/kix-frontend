import { WidgetComponentState, Contact } from "@kix/core/dist/model";
import { ContactLabelProvider } from "@kix/core/dist/browser/contact";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public contact: Contact = null,
        public labelProvider: ContactLabelProvider = new ContactLabelProvider()
    ) {
        super();
    }

}
