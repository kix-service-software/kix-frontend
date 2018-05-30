import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser";
import { CustomerContext } from "@kix/core/dist/browser/customer";
import { ContextType, ConfiguredWidget } from "@kix/core/dist/model";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, context: CustomerContext) => {
                if (contextId === CustomerContext.CONTEXT_ID) {
                    this.state.contentWidgets = context.getContent();
                }
            }
        });
        ContextService.getInstance().provideContext(new CustomerContext(), true, ContextType.MAIN);
    }

    private getTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }
}

module.exports = Component;
