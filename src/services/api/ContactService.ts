import { IContactService } from "@kix/core/dist/services/api/IContactService";
import { ObjectService } from './ObjectService';
import { Contact, ContactSource, SortOrder } from "@kix/core/dist/model/";
import { ContactResponse, ContactsResponse } from "@kix/core/dist/api/";

export class ContactService extends ObjectService<Contact> implements IContactService {

    protected RESOURCE_URI: string = "contacts";

    public async getContacts(token: string): Promise<Contact[]> {
        const response = await this.getObjects<ContactsResponse>(token);
        return response.Contact;
    }

    public async getContact(token: string, contactId: string, query?: any): Promise<Contact> {
        const response = await this.getObject<ContactResponse>(
            token, contactId
        );

        return response.Contact;
    }

}
