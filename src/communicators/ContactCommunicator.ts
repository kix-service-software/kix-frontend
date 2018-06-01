import {
    SocketEvent, ContactEvent, ContactsLoadRequest, ContactsLoadResponse,
    GetContactTicketCountRequest, GetContactTicketCountResponse, ContextEvent,
    CreateContactRequest, CreateContactResponse
} from '@kix/core/dist/model';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class ContactCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'contacts';
    }

    protected registerEvents(): void {
        this.registerEventHandler(ContactEvent.GET_TICKET_COUNT, this.getTicketCount.bind(this));
        this.registerEventHandler(ContactEvent.LOAD_CONTACTS, this.loadContacts.bind(this));
        this.registerEventHandler(ContactEvent.CREATE_CONTACT, this.createContact.bind(this));
    }

    private async loadContacts(data: ContactsLoadRequest): Promise<CommunicatorResponse<ContactsLoadResponse>> {
        const contacts = await this.contactService.getContacts(
            data.token, data.limit, data.searchValue, data.customerId
        );
        const response = new ContactsLoadResponse(data.requestId, contacts);
        return new CommunicatorResponse(ContactEvent.CONTACTS_LOADED, response);
    }

    private async getTicketCount(
        data: GetContactTicketCountRequest
    ): Promise<CommunicatorResponse<GetContactTicketCountResponse>> {
        let response;
        await this.ticketService.getTicketCountForContact(
            data.token, data.contactId, data.stateTypeIds
        ).then((ticketCount: number) => {
            response = new GetContactTicketCountResponse(data.requestId, ticketCount);
        }).catch((error) => {
            return new CommunicatorResponse(ContactEvent.GET_TICKET_COUNT_ERROR, error);
        });

        return new CommunicatorResponse(ContactEvent.GET_TICKET_COUNT_FINISHED, response);
    }

    private async createContact(data: CreateContactRequest): Promise<CommunicatorResponse<CreateContactResponse>> {
        let response;
        await this.contactService.createContact(data.token, data.parameter)
            .then((contactId) => {
                const createTicketResponse = new CreateContactResponse(contactId);
                response = new CommunicatorResponse(ContactEvent.CREATE_CONTACT_FINISHED, createTicketResponse);
            })
            .catch((error) => {
                response = new CommunicatorResponse(ContactEvent.CREATE_CONTACT_ERROR, error.message);
            });

        return response;
    }

}
