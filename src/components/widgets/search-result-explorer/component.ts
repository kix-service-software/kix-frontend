import { ComponentState } from './ComponentState';
import { ContextService, IdService, IKIXObjectSearchListener, KIXObjectSearchService } from '@kix/core/dist/browser';

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
        const categories = KIXObjectSearchService.getInstance().getSearchResultCategories();
    }
}

module.exports = Component;
