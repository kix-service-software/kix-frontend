import { ComponentState } from "./ComponentState";
import { FormInputComponent, Customer, KIXObjectType, ContextMode, TreeNode } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { ContextService } from "@kix/core/dist/browser";

class Component extends FormInputComponent<Customer, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        this.state.searchCallback = this.searchCustomers.bind(this);
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
    }

    public customerChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const customer = this.state.currentNode ? this.state.customers.find(
            (cu) => cu.CustomerID === this.state.currentNode.id
        ) : null;
        super.provideValue(customer);
    }

    private async searchCustomers(limit: number, searchValue: string): Promise<TreeNode[]> {
        this.state.customers = await ContextService.getInstance().loadObjects<Customer>(
            KIXObjectType.CUSTOMER, null, ContextMode.DASHBOARD, null, null, null, searchValue, limit
        );

        let treeNodes = [];
        if (searchValue && searchValue !== '') {
            treeNodes = this.state.customers.map(
                (c) => new TreeNode(c.CustomerID, c.DisplayValue, 'kix-icon-man-house')
            );
        }

        return treeNodes;
    }

}

module.exports = Component;
