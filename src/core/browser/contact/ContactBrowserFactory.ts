import { IKIXObjectFactory } from "../kix";
import { Contact, ContactFactory } from "../../model";

export class ContactBrowserFactory implements IKIXObjectFactory<Contact> {

    private static INSTANCE: ContactBrowserFactory;

    public static getInstance(): ContactBrowserFactory {
        if (!ContactBrowserFactory.INSTANCE) {
            ContactBrowserFactory.INSTANCE = new ContactBrowserFactory();
        }
        return ContactBrowserFactory.INSTANCE;
    }

    public async create(contact: Contact): Promise<Contact> {
        return ContactFactory.create(contact);
    }

}
