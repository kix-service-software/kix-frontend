import { ContextType, Context } from "@kix/core/dist/model";
import { IContextServiceListener, ContextService } from "@kix/core/dist/browser";
import { ComponentState } from './ComponentState';

class BreadcrumbComponent implements IContextServiceListener {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().registerListener(this);
        this.state.loading = false;
    }

    public async contextChanged(
        newContextId: string, newContext: Context, type: ContextType, fromHistory: boolean
    ): Promise<void> {
        if (type === ContextType.MAIN) {
            this.state.loading = true;
            this.state.contexts = [];
            this.state.icon = null;

            const breadcrumbInformation = newContext.getBreadcrumbInformation();
            this.state.icon = breadcrumbInformation.icon;
            for (const contextId of breadcrumbInformation.contextIds) {
                const context = await ContextService.getInstance().getContext(contextId);
                const displayText = await context.getDisplayText();
                this.state.contexts.push([contextId, displayText]);
            }
            this.state.loading = false;
        }
    }

    public changeContext(contextId: string): void {
        ContextService.getInstance().setContext(contextId, null, null);
    }

}

module.exports = BreadcrumbComponent;
