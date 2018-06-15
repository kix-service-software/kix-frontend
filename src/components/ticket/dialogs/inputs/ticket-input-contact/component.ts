import { TicketInputContactComponentState } from "./TicketInputContactComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    AutoCompleteConfiguration,
    Contact,
    FormDropdownItem, FormInputComponentState,
    ObjectIcon, Form, FormFieldValue, FormInputComponent, KIXObjectType, ContextMode
} from "@kix/core/dist/model";
import { ContactService } from "@kix/core/dist/browser/contact";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputContactComponent extends FormInputComponent<Contact, TicketInputContactComponentState> {

    public onCreate(): void {
        this.state = new TicketInputContactComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        this.state.searchCallback = this.searchContacts.bind(this);
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        return;
    }

    private contactChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? item.object : null);
    }

    private async searchContacts(limit: number, searchValue: string): Promise<FormDropdownItem[]> {
        this.state.contacts = await ContextService.getInstance().loadObjects<Contact>(
            KIXObjectType.CONTACT, null, ContextMode.DETAILS, null, null, searchValue, limit
        );

        let items = [];
        if (searchValue && searchValue !== '') {
            items = this.state.contacts.map(
                (c) => new FormDropdownItem(c.ContactID, 'kix-icon-man-bubble', c.DisplayValue, null, c)
            );
        }

        return items;
    }

}

module.exports = TicketInputContactComponent;
