import { FormInputComponent, TreeNode, FormFieldOptionsForDefaultSelectInput } from "../../../../../core/model";
import { CompontentState } from "./CompontentState";

class Component extends FormInputComponent<string | number | string[] | number[], CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.prepareList();
        this.setCurrentNode();
    }

    private prepareList(): void {
        if (this.state.field && this.state.field.options && !!this.state.field.options) {
            const nodesOption = this.state.field.options.find(
                (o) => o.option === FormFieldOptionsForDefaultSelectInput.NODES
            );
            this.state.nodes = nodesOption ? nodesOption.value : [];

            const selectedNodesOption = this.state.field.options.find(
                (o) => o.option === FormFieldOptionsForDefaultSelectInput.NODES
            );
            this.state.selectedNodes = selectedNodesOption ? selectedNodesOption.value : null;

            const asMultiselectOption = this.state.field.options.find(
                (o) => o.option === FormFieldOptionsForDefaultSelectInput.MULTI
            );
            this.state.asMultiselect = asMultiselectOption && typeof asMultiselectOption.value === 'boolean'
                ? asMultiselectOption.value : false;
        }
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            if (Array.isArray(this.state.defaultValue.value)) {
                this.state.selectedNodes = this.state.nodes.filter(
                    (n) => (this.state.defaultValue.value as Array<string | number>).some((dv) => dv === n.id)
                );
            } else {
                this.state.selectedNodes = [this.state.nodes.find((n) => n.id === this.state.defaultValue.value)];
            }
            super.provideValue(
                this.state.selectedNodes && !!this.state.selectedNodes.length
                    ? this.state.selectedNodes.map((sn) => sn.id) : null);
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        this.state.selectedNodes = nodes && nodes.length ? nodes : null;
        super.provideValue(
            this.state.selectedNodes && !!this.state.selectedNodes.length
                ? this.state.selectedNodes.map((sn) => sn.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
