import { ComponentState } from './ComponentState';
import {
    ContextService,
    IdService,
    IKIXObjectSearchListener,
    KIXObjectSearchService,
    SearchResultCategory
} from '@kix/core/dist/browser';
import { TreeNode, KIXObjectType } from '@kix/core/dist/model';

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
        this.state.contextId = context.descriptor.contextId;
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.prepareTree();
        const activeCategory = KIXObjectSearchService.getInstance().getActiveSearchResultExplorerCategory();
        if (activeCategory) {
            this.state.activeNode = this.getActiveNode(activeCategory.objectType);
        }
    }

    public searchCriteriasChanged(): void {
        return;
    }

    public searchCleared(): void {
        // TODO: Baum zurücksetzen?
    }

    public searchFinished(): void {
        this.prepareTree();
        this.activeNodeChanged(this.state.nodes[0]);
    }

    private prepareTree(): void {
        this.rootCategory = KIXObjectSearchService.getInstance().getSearchResultCategories();
        const searchCache = KIXObjectSearchService.getInstance().getSearchCache();
        this.state.nodes = searchCache && this.rootCategory ?
            this.prepareTreeNodes([this.rootCategory], true, searchCache.result.length) : [];
    }

    private prepareTreeNodes(
        categories: SearchResultCategory[], isRoot: boolean = false, rootLenght?: number
    ): TreeNode[] {
        let nodes: TreeNode[] = [];
        if (categories) {
            nodes = categories.map((category: SearchResultCategory) => {
                return new TreeNode(
                    category.objectType,
                    category.label + (isRoot ? ` (${rootLenght})` : ''),
                    null, null,
                    this.prepareTreeNodes(category.children),
                    null, null, null, null, (isRoot ? true : false)
                );
            });
        }
        return nodes;
    }

    public activeNodeChanged(node: TreeNode): void {
        this.state.activeNode = node;
        if (this.state.activeNode) {
            const activeCategory = this.getActiveCategory(this.state.activeNode.id);
            KIXObjectSearchService.getInstance().setActiveSearchResultExplorerCategory(activeCategory);
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
