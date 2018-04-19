import { TicketInputContactComponentState } from "./TicketInputContactComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    AutoCompleteConfiguration,
    Contact,
    FormDropdownItem, FormInputComponentState,
    ObjectIcon, Form, FormFieldValue
} from "@kix/core/dist/model";
import { ContactService } from "@kix/core/dist/browser/contact";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputContactComponent {

    private state: TicketInputContactComponentState;

    public onCreate(): void {
        this.state = new TicketInputContactComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        this.state.items = [];
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
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
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue(this.state.field, value);
    }

}

module.exports = TicketInputContactComponent;
