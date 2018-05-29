import { TicketService } from "@kix/core/dist/browser/ticket/";
import { ContextService } from "@kix/core/dist/browser/context";
import { Contact, KIXObjectType } from "@kix/core/dist/model";
import { ContactInfoComponentState } from "./ContactInfoComponentState";

class ContactInfoComponent {

    private state: ContactInfoComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext(this.state.contextType);
        context.registerListener({
            objectChanged: (objectId: number, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT && this.contactChanged(contact)) {
                    this.state.contact = contact;
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; }
        });
        this.state.contact = context.getObjectByType<Contact>(KIXObjectType.CONTACT);
    }

    private contactChanged(contact: Contact): boolean {
        let changed = true;

        if (this.state.contact && contact) {
            changed = contact && !this.state.contact.equals(contact);
        } else {
            changed = true;
        }

        return changed;
    }

}

module.exports = ContactInfoComponent;
