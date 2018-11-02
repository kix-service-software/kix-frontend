import { ComponentState } from "./ComponentState";
import {
    ObjectIcon, TreeNode, FormInputComponent, KIXObjectType,
    FilterCriteria, FilterDataType, FilterType, KIXObjectLoadingOptions
} from "@kix/core/dist/model";
import { FAQCategory, FAQCategoryProperty } from "@kix/core/dist/model/kix/faq";
import { KIXObjectService, SearchOperator } from "@kix/core/dist/browser";

class Component extends FormInputComponent<number[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const categoryFilter = [
            new FilterCriteria(
                FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, null
            )
        ];
        const loadingOptions = new KIXObjectLoadingOptions(null, categoryFilter, null, null, null,
            ['SubCategories', 'Articles'], ['SubCategories']
        );

        const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
            KIXObjectType.FAQ_CATEGORY_HIERARCHY, null, loadingOptions
        );

        this.state.nodes = this.prepareTree(faqCategories);
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
