import { ComponentState } from "./ComponentState";
import { ContextService, IContextServiceListener } from "@kix/core/dist/browser";
import { ContextType, Context, ContextConfiguration } from "@kix/core/dist/model";
import { ContextHistoryEntry } from "@kix/core/dist/browser/context/ContextHistoryEntry";

class Component implements IContextServiceListener {

    public state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().registerListener(this);
    }

    private toggleList(): void {
        this.state.minimized = !this.state.minimized;
    }

    public navigate(entry: ContextHistoryEntry): void {
        ContextService.getInstance().setContext(null, null, null, null, entry);
    }

    public contextChanged(contextId: string, context: Context<ContextConfiguration>, type: ContextType): void {
        this.state.history = ContextService.getInstance().getHistory();
    }

}

module.exports = Component;
