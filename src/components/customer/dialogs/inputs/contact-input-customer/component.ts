import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, Customer, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { KIXObjectService } from "../../../../../core/browser";

class Component extends FormInputComponent<Customer, ComponentState> {

    private customers: Customer[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.searchCustomers.bind(this);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const customer = this.state.defaultValue.value;
            this.state.currentNode = this.createTreeNode(customer);
            this.state.nodes = [this.state.currentNode];
            super.provideValue(customer);
        }
    }

    public customerChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const customer = this.state.currentNode ? this.customers.find(
            (cu) => cu.CustomerID === this.state.currentNode.id
        ) : null;
        super.provideValue(customer);
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
