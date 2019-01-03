import { ComponentState } from "./ComponentState";
import { ContextService } from "../../../../../core/browser/context";
import {
    ObjectIcon, TicketProperty, FormInputComponent, TreeNode, KIXObjectType, Sla
} from "../../../../../core/model";
import { KIXObjectService } from "../../../../../core/browser";

class Component extends FormInputComponent<number, ComponentState>  {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const slas = await KIXObjectService.loadObjects<Sla>(KIXObjectType.SLA);
        this.state.nodes = slas.map((s) =>
            new TreeNode(s.SLAID, s.Name, null)
        );
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
