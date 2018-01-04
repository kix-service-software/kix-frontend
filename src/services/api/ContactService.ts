import { IContactService } from "@kix/core/dist/services/api/IContactService";
import { ObjectService } from './ObjectService';
import { Contact, ContactSource } from "@kix/core/dist/model/";
import {
    CreateContact,
    CreateContactRequest,
    CreateContactResponse,
    ContactResponse,
    ContactsResponse,
    ContactSourcesResponse,
    UpdateContact,
    UpdateContactResponse,
    UpdateContactRequest
} from "@kix/core/dist/api/";
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class ContactService extends ObjectService<Contact> implements IContactService {

    protected RESOURCE_URI: string = "contacts";

    public async getContacts(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Contact[]> {

        const response = await this.getObjects<ContactsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Contact;
    }

    public async getContactSources(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<ContactSource[]> {
        const response = await this.getObjects<ContactSourcesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.ContactSource;
    }

    public async getContact(token: string, contactId: string, query?: any): Promise<Contact> {
        const response = await this.getObject<ContactResponse>(
            token, contactId
        );

        return response.Contact;
    }

    public async createContact(token: string, sourceId: string, createContact: CreateContact): Promise<string> {
        const response = await this.createObject<CreateContactResponse, CreateContactRequest>(
            token, this.RESOURCE_URI, new CreateContactRequest(sourceId, createContact)
        );

        return response.ContactID;
    }

    public async updateContact(token: string, contactId: string, updateContact: UpdateContact): Promise<string> {
        const uri = this.buildUri(this.RESOURCE_URI, contactId);
        const response = await this.updateObject<UpdateContactResponse, UpdateContactRequest>(
            token, uri, new UpdateContactRequest(updateContact)
        );

        return response.ContactID;
    }

    public async deleteContact(token: string, contactId: string): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, contactId);
        await this.deleteObject<void>(token, uri);
    }

}
