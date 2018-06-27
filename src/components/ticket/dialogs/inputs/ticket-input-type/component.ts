import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { ObjectIcon, TicketProperty, FormInputComponent, TreeNode, FormContext } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.multiselect = this.state.formContext === FormContext.SEARCH;
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = objectData.ticketTypes.map((t) =>
            new TreeNode(t.ID, t.Name, new ObjectIcon(TicketProperty.TYPE_ID, t.ID))
        );
    }

    public typeChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

}

module.exports = Component;
