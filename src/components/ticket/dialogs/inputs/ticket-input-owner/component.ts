import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormInputComponent, TreeNode } from "@kix/core/dist/model";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = objectData.agents.map((a) => new TreeNode(a.UserID, a.UserFullname, 'kix-icon-man'));
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
        }
    }

    public ownerChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

}

module.exports = Component;
