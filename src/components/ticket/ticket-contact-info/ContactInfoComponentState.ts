import { ContextType, Contact } from "@kix/core/dist/model";
import { ContactLabelProvider } from "@kix/core/dist/browser/contact";

export class ContactInfoComponentState {

    public constructor(
        public contact: Contact = null,
        public contactId: string = null,
        public labelProvider: ContactLabelProvider = new ContactLabelProvider(),
        public error: any = null
    ) { }

}
