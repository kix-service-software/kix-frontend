import { ComponentState } from "./ComponentState";
import {
    ObjectIcon, TreeNode, FormInputComponent, KIXObjectType,
    FilterCriteria, FilterDataType, FilterType, KIXObjectLoadingOptions
} from "../../../../../core/model";
import { FAQCategory, FAQCategoryProperty } from "../../../../../core/model/kix/faq";
import { KIXObjectService, SearchOperator } from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<number[], ComponentState> {

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
            const node = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            this.state.currentNodes = node ? [node] : [];
            super.provideValue(
                this.state.currentNodes && this.state.currentNodes.length
                    ? this.state.currentNodes[0].id
                    : null
            );
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
