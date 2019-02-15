import { ComponentState } from './ComponentState';
import { ContextService, IContextServiceListener, KIXObjectSearchService } from "../../../core/browser";
import { ContextMode, ContextType, ContextConfiguration, Context, CacheState } from "../../../core/model";
import { SearchContext } from '../../../core/browser/search/context';

class Component implements IContextServiceListener {

    public listenerId: string;

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = 'kix-search-module-listener';
    }

    public onInput(input: any): void {
        this.state.history = input.history;
    }

    public onMount(): void {
        if (!this.state.history) {
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
        ContextService.getInstance().registerListener(this);
    }

    public contextChanged(
        contextId: string, context: Context<ContextConfiguration>, type: ContextType, history: boolean
    ): void {
        if (contextId === SearchContext.CONTEXT_ID && !history) {
            const cache = KIXObjectSearchService.getInstance().getSearchCache();
            if (cache) {
                cache.status = CacheState.INVALID;
            }

            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
    }
}

module.exports = Component;
