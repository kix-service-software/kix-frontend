import { ComponentState } from './ComponentState';
import { ContextService, KIXObjectSearchService, IContextServiceListener } from "@kix/core/dist/browser";
import { ContextMode, ContextType, ContextConfiguration, Context } from "@kix/core/dist/model";
import { SearchContext } from '@kix/core/dist/browser/search';

class Component implements IContextServiceListener {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.fromHistory = input.fromHistory;
    }

    public onMount(): void {
        if (!this.state.fromHistory) {
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
        ContextService.getInstance().registerListener(this);
    }

    public contextChanged(
        contextId: string, context: Context<ContextConfiguration>, type: ContextType, fromHistory: boolean
    ): void {
        if (contextId === SearchContext.CONTEXT_ID && !fromHistory) {
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
    }

    public openNewSearchDialog(): void {
        KIXObjectSearchService.getInstance().clearSearchCache();
        ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
    }

    public openEditSearchDialog(): void {
        ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
    }


}

module.exports = Component;
