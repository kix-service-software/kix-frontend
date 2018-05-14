import { TicketInputTypeComponentState } from "./TicketInputTypeComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, Contact, FormInputComponentState,
    FormFieldValueChangeEvent, FormFieldValue, IFormEvent
} from "@kix/core/dist/model";
import { CustomerService } from "@kix/core/dist/browser/customer";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputTypeComponent {

    private state: TicketInputTypeComponentState;

    public onCreate(): void {
        this.state = new TicketInputTypeComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.registerListener(this.formChanged.bind(this));

        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            if (value) {
                this.state.currentItem = this.state.items.find((i) => i.id === value.value);
            }
        }
    }

    private async loadCustomers(customerIds: string[]): Promise<void> {
        const customers = await CustomerService.getInstance().loadContacts(customerIds);
        this.state.items = customers.map(
            (c) => new FormDropdownItem(c.CustomerID, 'kix-icon-man-house', c.DisplayValue)
        );

        this.state.currentItem = this.state.items.find((i) => i.id === this.state.primaryCustomerId);
        this.itemChanged(this.state.currentItem);
    }

    private formChanged(event: IFormEvent): void {
        if (event instanceof FormFieldValueChangeEvent) {
            if (event.formField.property === TicketProperty.CUSTOMER_USER_ID) {
                if (event.formFieldValue.value) {
                    const contact = event.formFieldValue.value;
                    this.state.primaryCustomerId = contact.UserCustomerID;
                    this.loadCustomers(contact.UserCustomerIDs);
                    this.state.hasContact = true;
                } else {
                    this.state.currentItem = null;
                    this.state.hasContact = false;
                    this.state.items = [];
                }
            }
        }
    }

    private getPlaceholder(): string {
        let placeholder = (this.state.field.required ? this.state.field.label : "");

        if (!this.state.hasContact) {
            placeholder = "Bitte Ansprechpartner auswählen.";
        }

        return placeholder;
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<number>(this.state.field.property, item ? Number(item.id) : null);
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.invalid = !fieldValue.valid;
    }

}

module.exports = TicketInputTypeComponent;
