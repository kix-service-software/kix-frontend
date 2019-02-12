import { ComponentState } from "./ComponentState";
import { TicketProperty, FormInputComponent, TreeNode } from "../../../../../core/model";
import { TicketService } from "../../../../../core/browser/ticket";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.nodes = await TicketService.getInstance().getTreeNodes(TicketProperty.PRIORITY_ID);
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            if (Array.isArray(this.state.defaultValue.value)) {
                this.state.currentNode = this.state.defaultValue.value.length ?
                    this.state.nodes.find((n) => n.id === this.state.defaultValue.value[0]) : null;
            } else {
                this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            }
            super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
        }
    }

    public priorityChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
