import { ComponentState } from './ComponentState';
import { ContextService } from "@kix/core/dist/browser/context";

class Component {


    public state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : 'Tickets';

        this.state.chartConfig = this.state.widgetConfiguration.settings;
    }

}

module.exports = Component;
