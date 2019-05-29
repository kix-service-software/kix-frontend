import { ComponentState } from "./ComponentState";
import {
    TicketProperty, TreeNode, FormInputComponent, FormFieldOptions, DispatchingType
} from "../../../../../../core/model";
import { TicketService } from "../../../../../../core/browser/ticket";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const validOption = this.state.field.options
            ? this.state.field.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID)
            : null;

        const showInvalid = validOption ? validOption.value : false;

        const queueNodes = await TicketService.getInstance().getTreeNodes(
            TicketProperty.QUEUE_ID, showInvalid
        );
        this.state.nodes = [
            new TreeNode(DispatchingType.FRONTEND_KEY_DEFAULT, 'Translatable#Default'),
            ...queueNodes
        ];
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            let node;
            if (Array.isArray(this.state.defaultValue.value)) {
                node = this.findNode(this.state.defaultValue.value[0]);
            } else {
                node = this.findNode(this.state.defaultValue.value);
            }
            this.state.currentNode = node;
        } else {
            this.state.currentNode = this.findNode(DispatchingType.FRONTEND_KEY_DEFAULT);
        }
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    private findNode(id: any, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let returnNode: TreeNode;
        if (Array.isArray(nodes)) {
            returnNode = nodes.find((n) => n.id === id);
            if (!returnNode) {
                for (const node of nodes) {
                    if (node.children && Array.isArray(node.children)) {
                        returnNode = this.findNode(id, node.children);
                        if (returnNode) {
                            break;
                        }
                    }
                }
            }
        }
        return returnNode;
    }


    public nodeChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
