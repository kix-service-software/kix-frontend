import { ContextService } from "@kix/core/dist/browser/context";
import { Contact, KIXObjectType, ContextMode } from "@kix/core/dist/model";
import { ContactInfoComponentState } from "./ContactInfoComponentState";
import { KIXObjectService } from "@kix/core/dist/browser";

class ContactInfoComponent {

    private state: ContactInfoComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.contactId = input.contactId;
        this.loadContact();
    }

    public onMount(): void {
        this.loadContact();
    }

    private async loadContact(): Promise<void> {
        this.state.error = null;
        this.state.contact = null;

        if (this.state.contactId) {
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [this.state.contactId]
            ).catch((error) => {
                this.state.error = error;
            });

            if (contacts && contacts.length) {
                this.state.contact = contacts[0];
            }
        }
    }

}

module.exports = ContactInfoComponent;
