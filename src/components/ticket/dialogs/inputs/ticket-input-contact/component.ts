import { TicketInputContactComponentState } from "./TicketInputContactComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon } from "@kix/core/dist/model";
import { ContactService } from "@kix/core/dist/browser/contact";

class TicketInputContactComponent {

    private state: TicketInputContactComponentState;

    public onCreate(): void {
        this.state = new TicketInputContactComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

    public onMount(): void {
        this.state.items = [];
        this.loadContacts();
    }

    private async loadContacts(): Promise<void> {
        const contacts = await ContactService.getInstance().loadContacts();
        this.state.items = contacts.map(
            (c) => new FormDropdownItem(c.ContactID, 'kix-icon-man', c.UserEmail)
        );
    }

}

module.exports = TicketInputContactComponent;
