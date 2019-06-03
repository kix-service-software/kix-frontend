import { ComponentState } from "./ComponentState";
import { TreeNode, FormInputComponent, FormFieldOptions, KIXObjectType } from "../../../../../core/model";
import { FAQCategoryProperty } from "../../../../../core/model/kix/faq";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { FAQService } from "../../../../../core/browser/faq";
import { UIUtil } from "../../../../../core/browser";

class Component extends FormInputComponent<number[], ComponentState> {

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

        const categoryId = await UIUtil.getEditObjectId(KIXObjectType.FAQ_CATEGORY);
        const nodes = await FAQService.getInstance().getTreeNodes(
            FAQCategoryProperty.PARENT_ID, showInvalid, categoryId ? [categoryId] : null
        );

        this.state.nodes = nodes;
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            let ids: number[] = this.state.defaultValue.value;
            if (!Array.isArray(ids)) {
                ids = [ids];
            }
            const currentNodes: TreeNode[] = [];
            for (const id of ids) {
                const node = this.findNode(id);
                if (node) {
                    currentNodes.push(node);
                }
            }
            this.state.currentNodes = currentNodes;
            super.provideValue(
                this.state.currentNodes && this.state.currentNodes.length
                    ? this.state.currentNodes[0].id
                    : null
            );
        }
    }

    private findNode(id: number, nodes: TreeNode[] = this.state.nodes): TreeNode {
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

    public categoryChanged(nodes: TreeNode[]): void {
        this.state.currentNodes = nodes && nodes;
        super.provideValue(
            this.state.currentNodes && this.state.currentNodes.length
                ? this.state.currentNodes[0].id
                : null
        );
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
