import { ContextType, Contact } from "@kix/core/dist/model";

export class ContactInfoComponentState {

    public constructor(
        public contextType: ContextType = null,
        public contact: Contact = null
    ) { }

}
