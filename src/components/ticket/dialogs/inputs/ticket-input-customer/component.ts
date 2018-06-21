import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    TicketProperty, FormFieldValue, FormInputComponent, FormField, KIXObjectType, Customer, ContextMode, TreeNode
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class Component extends FormInputComponent<Customer, ComponentState> {

    private customers: Customer[] = [];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.registerListener({
            formValueChanged: (formField: FormField, value: FormFieldValue<any>) => {
                if (formField.property === TicketProperty.CUSTOMER_USER_ID) {
                    if (value.value) {
                        const contact = value.value;
                        this.state.primaryCustomerId = contact.UserCustomerID;
                        this.loadCustomers(contact.UserCustomerIDs);
                        this.state.hasContact = true;
                    } else {
                        this.state.currentNode = null;
                        this.state.hasContact = false;
                        this.state.nodes = [];
                        super.provideValue(null);
                    }
                }
            },
            updateForm: () => { return; }
        });
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            this.state.currentNode = this.state.nodes.find((i) => i.id === value.value);
        }
    }

    public getPlaceholder(): string {
        let placeholder = (this.state.field.required ? this.state.field.label : "");

        if (!this.state.hasContact) {
            placeholder = "Bitte Ansprechpartner auswählen.";
        }

        return placeholder;
    }

    private async loadCustomers(customerIds: string[]): Promise<void> {
        this.state.loading = true;
        this.customers = await ContextService.getInstance().loadObjects<Customer>(
            KIXObjectType.CUSTOMER, customerIds, ContextMode.DASHBOARD, null
        );
        this.state.nodes = this.customers.map(
            (c) => new TreeNode(c.CustomerID, c.DisplayValue, 'kix-icon-man-house')
        );

        this.state.currentNode = this.state.nodes.find((i) => i.id === this.state.primaryCustomerId);
        this.customerChanged([this.state.currentNode]);
        this.state.loading = false;
    }

    private customerChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const customer = this.state.currentNode ? this.customers.find(
            (cu) => cu.CustomerID === this.state.currentNode.id
        ) : null;
        super.provideValue(customer);
    }

}

module.exports = Component;
