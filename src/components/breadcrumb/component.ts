import { ContextType, Context } from "@kix/core/dist/model";
import { IContextServiceListener, ContextService } from "@kix/core/dist/browser";
import { ComponentState } from './ComponentState';
import { RoutingConfiguration } from "@kix/core/dist/browser/router";

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
        newContextId: string, newContext: Context, type: ContextType, history: boolean
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

            const currentContextDisplayText = await newContext.getDisplayText(true);
            this.state.contexts.push([newContextId, currentContextDisplayText]);

            this.state.loading = false;
        }
    }

    public getRoutingConfiguration(contextId: string, index: number): RoutingConfiguration {
        if (index < this.state.contexts.length - 1) {
            return new RoutingConfiguration(null, contextId, null, null, null);
        }
        return null;
    }

}

module.exports = BreadcrumbComponent;
