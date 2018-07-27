import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    ObjectIcon, TicketProperty, FormInputComponent, TreeNode, FormContext
} from "@kix/core/dist/model";

class Component extends FormInputComponent<number, ComponentState>  {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.nodes = objectData.slas.map((s) =>
                new TreeNode(s.ID, s.Name, new ObjectIcon(TicketProperty.SLA_ID, s.ID))
            );
        }
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
        }
    }

    public slaChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

}

module.exports = Component;
