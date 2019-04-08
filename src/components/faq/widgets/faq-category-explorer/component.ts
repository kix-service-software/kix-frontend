import { ComponentState } from './ComponentState';
import { ContextService, IdService, KIXObjectService, SearchOperator } from '../../../../core/browser';
import {
    TreeNode, KIXObjectType, KIXObjectLoadingOptions, FilterDataType, FilterType, FilterCriteria
} from '../../../../core/model';
import { FAQCategory, FAQCategoryProperty } from '../../../../core/model/kix/faq';
import { FAQContext } from '../../../../core/browser/faq';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

export class Component {

    private state: ComponentState;

    public listenerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('search-result-explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<FAQContext>(FAQContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const categoryFilter = [
            new FilterCriteria(
                FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, null
            )
        ];
        const loadingOptions = new KIXObjectLoadingOptions(null, categoryFilter, null, null, null,
            ['SubCategories', 'Articles'], ['SubCategories']
        );

        const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
            KIXObjectType.FAQ_CATEGORY, null, loadingOptions
        );

        this.state.nodes = await this.prepareTreeNodes(faqCategories);

        this.setActiveNode(context.faqCategory);
    }

    private setActiveNode(category: FAQCategory): void {
        if (category) {
            this.activeNodeChanged(this.getActiveNode(category));
        } else {
            this.showAll();
        }
    }

    private getActiveNode(category: FAQCategory, nodes: TreeNode[] = this.state.nodes
    ): TreeNode {
        let activeNode = nodes.find((n) => n.id.ID === category.ID);
        if (!activeNode) {
            for (let index = 0; index < nodes.length; index++) {
                activeNode = this.getActiveNode(category, nodes[index].children);
                if (activeNode) {
                    nodes[index].expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private async prepareTreeNodes(categories: FAQCategory[]): Promise<TreeNode[]> {
        const nodes = [];
        if (categories) {
            for (const c of categories) {
                const label = await this.getCategoryLabel(c);
                const children = await this.prepareTreeNodes(c.SubCategories);
                nodes.push(new TreeNode(c, label, null, null, children));
            }
        }

        return nodes;
    }

    private async getCategoryLabel(category: FAQCategory): Promise<string> {
        const name = await TranslationService.translate(category.Name, []);
        const count = this.countArticles(category);
        return `${name} (${count})`;
    }

    private countArticles(category: FAQCategory): number {
        let count = category.Articles ? category.Articles.length : 0;

        if (category.SubCategories) {
            category.SubCategories.forEach((c) => count += this.countArticles(c));
        }

        return count;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;

        const context = await ContextService.getInstance().getContext<FAQContext>(FAQContext.CONTEXT_ID);
        const category = node.id as FAQCategory;
        context.setAdditionalInformation([category.Name]);
        context.setFAQCategory(node.id);
    }

    public async showAll(): Promise<void> {
        const context = await ContextService.getInstance().getContext<FAQContext>(FAQContext.CONTEXT_ID);
        this.state.activeNode = null;

        const allText = await TranslationService.translate('Translatable#All');

        context.setAdditionalInformation([allText]);
        context.setFAQCategory(null);
    }

}

module.exports = Component;
