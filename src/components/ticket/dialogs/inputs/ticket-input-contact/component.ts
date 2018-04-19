import { TicketInputContactComponentState } from "./TicketInputContactComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, AutoCompleteConfiguration, Contact } from "@kix/core/dist/model";
import { ContactService } from "@kix/core/dist/browser/contact";
import { FormService, FormFieldValueChangeEvent, FormFieldValue } from "@kix/core/dist/browser/form";

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
        this.state.autoCompleteConfiguration =
            FormService.getInstance().getAutoCompleteConfiguration() || new AutoCompleteConfiguration();
        this.loadContacts();
    }

    private async loadContacts(): Promise<void> {
        this.state.isLoading = true;

        this.state.contacts = await ContactService.getInstance().loadContacts(
            this.state.autoCompleteConfiguration.limit
        );

        this.state.items = this.state.contacts.map(
            (c) => new FormDropdownItem(c.ContactID, 'kix-icon-man-bubble', c.UserEmail)
        );

        this.state.isLoading = false;
    }

    private contactChanged(item: FormDropdownItem): void {
        let value;
        if (item) {
            const contact = this.state.contacts.find((c) => c.ContactID === item.id);
            value = new FormFieldValue<Contact>(contact);
        } else {
            value = new FormFieldValue<Contact>(null);
        }
        FormService.getInstance().provideFormFieldValue(this.state.field, value);
    }

}

module.exports = TicketInputContactComponent;
