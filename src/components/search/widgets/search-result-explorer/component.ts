import { ComponentState } from './ComponentState';
import {
    ContextService,
    IdService,
    IKIXObjectSearchListener,
    KIXObjectSearchService,
    SearchResultCategory,
    ServiceRegistry,
    IKIXObjectService
} from '../../../../core/browser';
import { TreeNode, KIXObjectType } from '../../../../core/model';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

export class Component implements IKIXObjectSearchListener {

    private state: ComponentState;
    private rootCategory: SearchResultCategory;

    public listenerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('search-result-explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        KIXObjectSearchService.getInstance().registerListener(this);
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.contextId = context.getDescriptor().contextId;
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.prepareTree();
        const activeCategory = KIXObjectSearchService.getInstance().getActiveSearchResultExplorerCategory();
        if (activeCategory) {
            this.state.activeNode = this.getActiveNode(activeCategory.objectType);
        }
    }

    public searchCleared(): void {
        KIXObjectSearchService.getInstance().setActiveSearchResultExplorerCategory(null);
        this.state.nodes = null;
    }

    public async searchFinished(): Promise<void> {
        await this.prepareTree();
        this.activeNodeChanged(this.state.nodes[0]);
    }

    public searchResultCategoryChanged(): void {
        return;
    }

    private async prepareTree(): Promise<void> {
        this.rootCategory = await KIXObjectSearchService.getInstance().getSearchResultCategories();
        this.state.nodes = this.rootCategory ? await this.prepareTreeNodes([this.rootCategory], true) : [];
    }

    private async prepareTreeNodes(categories: SearchResultCategory[], isRoot: boolean = false): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        const searchCache = KIXObjectSearchService.getInstance().getSearchCache();
        if (searchCache && categories) {
            const objectService
                = ServiceRegistry.getServiceInstance<IKIXObjectService>(searchCache.objectType);
            if (objectService) {
                for (const category of categories) {
                    category.objectIds = objectService.determineDependendObjects(
                        searchCache.result, category.objectType
                    ) || [];

                    const label = await TranslationService.translate(category.label);
                    const children = await this.prepareTreeNodes(category.children);

                    nodes.push(new TreeNode(
                        category.objectType,
                        label + ` (${isRoot ? searchCache.result.length : category.objectIds.length})`,
                        null, null,
                        children,
                        null, null, null, null, isRoot
                    ));
                }
            }
        }
        return nodes;
    }

    public activeNodeChanged(node: TreeNode): void {
        this.state.activeNode = node;
        if (this.state.activeNode) {
            const newActiveCategory = this.getActiveCategory(this.state.activeNode.id);
            const activeCategory = KIXObjectSearchService.getInstance().getActiveSearchResultExplorerCategory();
            if (!activeCategory || newActiveCategory.label !== activeCategory.label) {
                KIXObjectSearchService.getInstance().setActiveSearchResultExplorerCategory(newActiveCategory);
            }
        }
    }

    private getActiveCategory(
        objectType: KIXObjectType,
        categories: SearchResultCategory[] = [this.rootCategory]
    ): SearchResultCategory {
        let activeCategory = categories.find((c) => c.objectType === objectType);
        if (!activeCategory) {
            for (let index = 0; index < categories.length; index++) {
                activeCategory = this.getActiveCategory(objectType, categories[index].children);
                if (activeCategory) {
                    break;
                }
            }
        }
        return activeCategory;
    }

    private getActiveNode(
        objectType: KIXObjectType,
        nodes: TreeNode[] = this.state.nodes
    ): TreeNode {
        let activeNode = nodes.find((n) => n.id === objectType);
        if (!activeNode) {
            for (let index = 0; index < nodes.length; index++) {
                activeNode = this.getActiveNode(objectType, nodes[index].children);
                if (activeNode) {
                    break;
                }
            }
        }
        return activeNode;
    }
}

module.exports = Component;
