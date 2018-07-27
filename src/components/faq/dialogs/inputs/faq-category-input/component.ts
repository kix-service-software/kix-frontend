import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { ObjectIcon, TreeNode, FormInputComponent } from "@kix/core/dist/model";
import { FAQCategory, FAQCategoryProperty } from "@kix/core/dist/model/kix/faq";

class Component extends FormInputComponent<number[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = this.prepareTree(objectData.faqCategories);
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
    }

    private prepareTree(faqCategories: FAQCategory[]): TreeNode[] {
        let nodes = [];
        if (faqCategories) {
            nodes = faqCategories.map((category: FAQCategory) => {
                const treeNode = new TreeNode(
                    category.ID, category.Name,
                    new ObjectIcon(FAQCategoryProperty.ID, category.ID),
                    null,
                    this.prepareTree(category.SubCategories)
                );
                return treeNode;
            });
        }
        return nodes;
    }

    public queueChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);

    }

}

module.exports = Component;
