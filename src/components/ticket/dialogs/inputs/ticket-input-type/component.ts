import { ComponentState } from "./ComponentState";
import {
    ObjectIcon, TicketProperty, FormInputComponent, TreeNode, TicketType, KIXObjectType
} from "@kix/core/dist/model";
import { KIXObjectService } from "@kix/core/dist/browser";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const types = await KIXObjectService.loadObjects<TicketType>(KIXObjectType.TICKET_TYPE, null);
        this.state.nodes = types.filter((t) => t.ValidID === 1).map(
            (t) => new TreeNode(t.ID, t.Name, new ObjectIcon(TicketProperty.TYPE_ID, t.ID))
        );
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
        }
    }

    public typeChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

}

module.exports = Component;
