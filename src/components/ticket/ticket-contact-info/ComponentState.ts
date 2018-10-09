import { Contact } from "@kix/core/dist/model";
import { ContactLabelProvider } from "@kix/core/dist/browser/contact";

export class ComponentState {

    public constructor(
        public contact: Contact = null,
        public contactId: string = null,
        public labelProvider: ContactLabelProvider = new ContactLabelProvider(),
        public error: any = null,
        public info: Array<[string, Array<[string, string]>]> = [],
        public groups: string[] = null
    ) { }

}
