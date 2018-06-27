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
    }

    public isExplorerMinimized(instanceId: string): boolean {
        const context = ContextService.getInstance().getActiveContext();
        return context.isExplorerExpanded(instanceId);
    }

    public searchCriteriasChanged(): void {
        return;
    }

    public searchCleared(): void {
        // TODO: Baum zurücksetzen?
    }

    public searchFinished(): void {
        const rootCategory = KIXObjectSearchService.getInstance().getSearchResultCategories();
        const searchCache = KIXObjectSearchService.getInstance().getSearchCache();
        this.state.nodes = searchCache && rootCategory ?
            this.prepareTreeNodes([rootCategory], searchCache.objectType, searchCache.result.length) : [];

    }

    private prepareTreeNodes(
        categories: SearchResultCategory[], objectType?: KIXObjectType, rootLenght?: number
    ): TreeNode[] {
        let nodes: TreeNode[] = [];
        if (categories) {
            nodes = categories.map((category: SearchResultCategory) => {
                return new TreeNode(
                    category.objectType,
                    category.label + (objectType && objectType === category.objectType ? ` (${rootLenght})` : ''),
                    null, null,
                    this.prepareTreeNodes(category.children)
                );
            });
        }
        return nodes;
    }
}

module.exports = Component;
