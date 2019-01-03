import { ComponentState } from "./ComponentState";
import { ContextService } from "../../../../../core/browser/context";
import {
    ObjectIcon, TicketProperty, FormInputComponent, TreeNode, TicketPriority, KIXObjectType
} from "../../../../../core/model";
import { KIXObjectService } from "../../../../../core/browser/kix/KIXObjectService";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const priorities = await KIXObjectService.loadObjects<TicketPriority>(
            KIXObjectType.TICKET_PRIORITY, null
        );

        this.state.nodes = priorities.map((p) =>
            new TreeNode(p.ID, p.Name, new ObjectIcon('Priority', p.ID))
        );
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

}

module.exports = Component;
