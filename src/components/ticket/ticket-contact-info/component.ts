import { TicketService } from "@kix/core/dist/browser/ticket/";
import { ContextService } from "@kix/core/dist/browser/context";
import { Contact, KIXObjectType, ContextMode } from "@kix/core/dist/model";
import { ContactInfoComponentState } from "./ContactInfoComponentState";

class ContactInfoComponent {

    private state: ContactInfoComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.contactId = input.contactId;
    }

    public async onMount(): Promise<void> {
        const contacts = await ContextService.getInstance().loadObjects<Contact>(
            KIXObjectType.CUSTOMER, [this.state.contactId], ContextMode.DETAILS, null
        );
        if (contacts && contacts.length) {
            this.state.contact = contacts[0];
        }
    }

}

module.exports = ContactInfoComponent;
