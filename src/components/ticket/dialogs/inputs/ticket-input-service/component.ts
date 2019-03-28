import { ComponentState } from "./ComponentState";
import { TicketProperty, TreeNode, FormInputComponent } from "../../../../../core/model";
import { TicketService } from "../../../../../core/browser/ticket";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);

        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.nodes = await TicketService.getInstance().getTreeNodes(TicketProperty.SERVICE_ID);
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.getCurrentServiceNode(this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
        }
    }

    private getCurrentServiceNode(id: number, nodes: TreeNode[] = this.state.nodes): TreeNode {
        for (const node of nodes) {
            if (node.id === id) {
                return node;
            }
            if (node.children && !!node.children.length) {
                const childNode = this.getCurrentServiceNode(id, node.children);
                if (childNode) {
                    return childNode;
                }
            }
        }
    }

    public serviceChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
