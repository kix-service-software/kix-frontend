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
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        return;
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }
}

module.exports = Component;
