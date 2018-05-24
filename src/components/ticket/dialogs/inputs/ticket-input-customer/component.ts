import { TicketInputCustomerComponentState } from "./TicketInputCustomerComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, Contact, FormInputComponentState,
    FormFieldValueChangeEvent, FormFieldValue, IFormEvent, UpdateFormEvent, FormInputComponent, FormField
} from "@kix/core/dist/model";
import { CustomerService } from "@kix/core/dist/browser/customer";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputTypeComponent extends FormInputComponent<number, TicketInputCustomerComponentState> {

    public onCreate(): void {
        this.state = new TicketInputCustomerComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.registerListener({
            formValueChanged: (formField: FormField, value: FormFieldValue<any>) => {
                if (formField.property === TicketProperty.CUSTOMER_USER_ID) {
                    if (value.value) {
                        const contact = value.value;
                        this.state.primaryCustomerId = contact.UserCustomerID;
                        this.loadCustomers(contact.UserCustomerIDs);
                        this.state.hasContact = true;
                    } else {
                        this.state.currentItem = null;
                        this.state.hasContact = false;
                        this.state.items = [];
                    }
                }
            },
            updateForm: () => { return; }
        });
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            this.state.currentItem = this.state.items.find((i) => i.id === value.value);
        }
    }

    private getPlaceholder(): string {
        let placeholder = (this.state.field.required ? this.state.field.label : "");

        if (!this.state.hasContact) {
            placeholder = "Bitte Ansprechpartner auswählen.";
        }

        return placeholder;
    }

    private async loadCustomers(customerIds: string[]): Promise<void> {
        const customers = await CustomerService.getInstance().loadContacts(customerIds);
        this.state.items = customers.map(
            (c) => new FormDropdownItem(c.CustomerID, 'kix-icon-man-house', c.DisplayValue, null, c)
        );

        this.state.currentItem = this.state.items.find((i) => i.id === this.state.primaryCustomerId);
        this.itemChanged(this.state.currentItem);
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? item.object : null);
    }

}

module.exports = TicketInputTypeComponent;
