import { Contact } from "../..";

export class ContactsLoadResponse {

    public constructor(
        public requestId: string,
        public contacts: Contact[]
    ) { }

}
