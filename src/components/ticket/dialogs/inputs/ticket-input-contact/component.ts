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
        this.state.searchCallback = this.searchContacts.bind(this);
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
    }

    private contactChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        let contact;
        if (item) {
            contact = this.state.contacts.find((c) => c.ContactID === item.id);
        }

        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<Contact>(this.state.field.property, contact);
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.invalid = !fieldValue.valid;
    }

    private async searchContacts(limit: number, searchValue: string): Promise<FormDropdownItem[]> {
        this.state.contacts = await ContactService.getInstance().loadContacts(limit, searchValue);

        let items = [];
        if (searchValue && searchValue !== '') {
            items = this.state.contacts.map(
                (c) => new FormDropdownItem(c.ContactID, 'kix-icon-man-bubble', c.DisplayValue)
            );
        }

        return items;
    }

}

module.exports = TicketInputContactComponent;
