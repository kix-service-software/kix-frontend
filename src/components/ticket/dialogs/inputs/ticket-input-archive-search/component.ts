import { ComponentState } from "./CompontentState";
import { FormDropdownItem, ArchiveFlag, FormInputComponent, TreeNode } from "@kix/core/dist/model";


class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        this.state.nodes = [
            new TreeNode(ArchiveFlag.ALL, 'Alle Tickets'),
            new TreeNode(ArchiveFlag.ARCHIVED, 'Archivierte Tickets'),
            new TreeNode(ArchiveFlag.NOT_ARCHIVED, 'Nicht archivierte Tickets')
        ];
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }
}

module.exports = Component;
