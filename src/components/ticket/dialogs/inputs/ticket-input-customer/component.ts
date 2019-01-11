import { ComponentState } from "./ComponentState";
import { ContextService } from "../../../../../core/browser/context";
import {
    TicketProperty, FormFieldValue, FormInputComponent, FormField,
    KIXObjectType, Customer, TreeNode
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { IdService, KIXObjectService } from "../../../../../core/browser";

class Component extends FormInputComponent<Customer, ComponentState> {

    private customers: Customer[] = [];
    private formListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.formListenerId = IdService.generateDateBasedId('TicketCustomerInput');
        FormService.getInstance().registerFormInstanceListener(this.formListenerId, {
            formListenerId: this.formListenerId,
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
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const customer = this.state.defaultValue.value;
            this.state.currentNode = new TreeNode(customer.CustomerID, customer.DisplayValue, 'kix-icon-man-bubble');
            this.state.nodes = [this.state.currentNode];
            super.provideValue(customer);
        }
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
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
        this.customers = await KIXObjectService.loadObjects<Customer>(
            KIXObjectType.CUSTOMER, customerIds
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

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
