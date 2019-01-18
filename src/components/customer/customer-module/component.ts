import { ComponentState } from "./ComponentState";
import { ContextService } from "../../../core/browser";
import { CustomerContext } from "../../../core/browser/customer";
import { ConfiguredWidget } from "../../../core/model";
import { ComponentsService } from "../../../core/browser/components";

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(CustomerContext.CONTEXT_ID) as CustomerContext);
        this.state.contentWidgets = context.getContent();
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }
}

module.exports = Component;
