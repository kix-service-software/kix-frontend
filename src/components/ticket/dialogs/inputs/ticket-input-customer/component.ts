import { ComponentState } from "./ComponentState";
import {
    TicketProperty, FormFieldValue, FormInputComponent, FormField,
    KIXObjectType, Customer, TreeNode, Contact
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { IdService, KIXObjectService } from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<string, ComponentState> {

    private customers: Customer[] = [];
    private formListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        this.state.placeholder = await TranslationService.translate('Translatable#Please select a contact');

    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.formListenerId = IdService.generateDateBasedId('TicketCustomerInput');
        await FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.formListenerId,
            formValueChanged: async (formField: FormField, value: FormFieldValue<any>) => {
                if (formField && formField.property === TicketProperty.CUSTOMER_USER_ID) {
                    if (value.value) {
                        const contacts = await KIXObjectService.loadObjects<Contact>(
                            KIXObjectType.CONTACT, [value.value]
                        );
                        if (contacts && contacts.length) {
                            const contact = contacts[0];
                            this.state.primaryCustomerId = contact.UserCustomerID;
                            this.loadCustomers(contact.UserCustomerIDs);
                            this.state.hasContact = true;
                        }
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

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const customers = await KIXObjectService.loadObjects<Customer>(
                KIXObjectType.CUSTOMER, [this.state.defaultValue.value]
            );

            if (customers && customers.length) {
                const customer = customers[0];
                this.state.currentNode = new TreeNode(
                    customer.CustomerID, customer.DisplayValue, 'kix-icon-man-bubble'
                );
                this.state.nodes = [this.state.currentNode];
                super.provideValue(customer.CustomerID);
            }
        }
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
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
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
