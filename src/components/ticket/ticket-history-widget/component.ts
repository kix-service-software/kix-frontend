import { ContextService } from "@kix/core/dist/browser/context/ContextService";

class TicketHistoryWidgetComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            ticketId: null,
            widgetConfiguration: null
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = input.ticketId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

}

module.exports = TicketHistoryWidgetComponent;
