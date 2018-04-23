import {
    ContactsLoadRequest,
    ContactsLoadResponse,
    ContactEvent,
    SocketEvent
} from '@kix/core/dist/model';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class ContactCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'contacts';
    }

    protected registerEvents(): void {
        this.registerEventHandler(ContactEvent.LOAD_CONTACTS, this.loadContacts.bind(this));
    }

    private async loadContacts(data: ContactsLoadRequest): Promise<CommunicatorResponse<ContactsLoadResponse>> {
        const contacts = await this.contactService.getContacts(data.token, data.limit, data.searchValue);
        const response = new ContactsLoadResponse(data.requestId, contacts);
        return new CommunicatorResponse(ContactEvent.CONTACTS_LOADED, response);
    }

}
