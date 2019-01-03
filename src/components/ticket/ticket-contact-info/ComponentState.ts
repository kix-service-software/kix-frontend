import { Contact } from "../../../core/model";
import { ContactLabelProvider } from "../../../core/browser/contact";

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
