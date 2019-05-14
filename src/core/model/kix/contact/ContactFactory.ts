import { Contact } from './Contact';
import { IObjectFactory } from '../IObjectFactory';
import { KIXObjectType } from '../KIXObjectType';

export class ContactFactory implements IObjectFactory<Contact> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CONTACT;
    }

    public create(contact?: Contact): Contact {
        const newContact = new Contact(contact);
        return newContact;
    }

}
