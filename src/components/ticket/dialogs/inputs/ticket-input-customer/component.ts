import { TicketInputTypeComponentState } from "./TicketInputTypeComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty, Contact } from "@kix/core/dist/model";
import { CustomerService } from "@kix/core/dist/browser/customer";
import { FormService, FormFieldValueChangeEvent } from "@kix/core/dist/browser/form";

class TicketInputTypeComponent {

    private state: TicketInputTypeComponentState;

    public onCreate(): void {
        this.state = new TicketInputTypeComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

    public onMount(): void {
        FormService.getInstance().registerListener(this.formChanged.bind(this));
        const formFieldValue = FormService.getInstance().getFormFieldValue<Contact>(TicketProperty.CUSTOMER_USER_ID);
        if (formFieldValue && formFieldValue.value) {
            this.loadCustomers([formFieldValue.value.UserCustomerID]);
            this.state.hasContact = true;
        }
    }

    private async loadCustomers(customerIds: string[]): Promise<void> {
        const customers = await CustomerService.getInstance().loadContacts(customerIds);
        this.state.items = customers.map(
            (c) => new FormDropdownItem(c.CustomerID, 'kix-icon-man-house', c.CustomerCompanyName)
        );
    }

    private formChanged(event: FormFieldValueChangeEvent<Contact>): void {
        if (event.formField.property === TicketProperty.CUSTOMER_USER_ID) {
            if (event.formFieldValue.value) {
                const contact = event.formFieldValue.value;
                this.loadCustomers([contact.UserCustomerID]);
                this.state.hasContact = true;
            } else {
                this.state.hasContact = false;
                this.state.items = [];
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

}

module.exports = TicketInputTypeComponent;
