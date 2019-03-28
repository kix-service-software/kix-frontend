import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, Customer, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { KIXObjectService } from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<string, ComponentState> {

    private customers: Customer[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.searchCustomers.bind(this);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        this.setCurrentNode();
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const customers = await KIXObjectService.loadObjects<Customer>(
                KIXObjectType.CUSTOMER, [this.state.defaultValue.value]
            );

            if (customers && customers.length) {
                const customer = customers[0];
                this.state.currentNode = this.createTreeNode(customer);
                this.state.nodes = [this.state.currentNode];
                super.provideValue(customer.CustomerID);
            }
        }
    }

    public customerChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    private async searchCustomers(limit: number, searchValue: string): Promise<TreeNode[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
        this.customers = await KIXObjectService.loadObjects<Customer>(
            KIXObjectType.CUSTOMER, null, loadingOptions, null, false
        );

        this.state.nodes = [];
        if (searchValue && searchValue !== '') {
            this.state.nodes = this.customers.map((c) => this.createTreeNode(c));
        }

        return this.state.nodes;
    }

    private createTreeNode(customer: Customer): TreeNode {
        return new TreeNode(customer.CustomerID, customer.DisplayValue, 'kix-icon-man-house');
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
