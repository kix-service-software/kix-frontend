import { ObjectFactory } from "./ObjectFactory";
import { Contact, KIXObjectType } from "../../model";

export class ContactFactory extends ObjectFactory<Contact> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CONTACT;
    }

    public create(contact?: Contact): Contact {
        const newContact = new Contact(contact);
        return newContact;
    }

}
