import { DialogService, ContextService, ComponentsService, TableConfiguration } from "../../../../core/browser";
import { ComponentState } from "./ComponentState";
import { CompareConfigItemVersionDialogContext } from "../../../../core/browser/cmdb";

class Component {

    private state: ComponentState;

    private context: CompareConfigItemVersionDialogContext;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = await ContextService.getInstance().getContext<CompareConfigItemVersionDialogContext>(
            CompareConfigItemVersionDialogContext.CONTEXT_ID
        );
        this.state.compareWidget = this.context.getCompareWidget();
    }

    public async submit(): Promise<void> {
        DialogService.getInstance().closeMainDialog();
    }

    public getCompareWidgetTemplate(instanceId: string): any {
        return ComponentsService.getInstance().getComponentTemplate(this.state.compareWidget.configuration.widgetId);
    }

}

module.exports = Component;
