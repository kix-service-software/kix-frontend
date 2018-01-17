import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import { TicketService } from "@kix/core/dist/browser/ticket";
import { TicketHistory } from "@kix/core/dist/model/ticket/TicketHistory";
import { TicketHistoryComponentState } from './TicketHistoryComponentState';

class TicketHistoryWidgetComponent {

    private state: TicketHistoryComponentState;

    public onCreate(input: any): void {
        this.state = new TicketHistoryComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = input.ticketId;
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.getTicket();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.getTicket();
        }
    }

    private getTicket(): void {
        if (this.state.ticketId) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails) {
                this.state.history = ticketDetails.history.sort(
                    (a: TicketHistory, b: TicketHistory) => b.CreateTime.localeCompare(a.CreateTime)
                );
            }
        }
    }

    private print(): void {
        alert('Historie drucken ...');
    }

}

module.exports = TicketHistoryWidgetComponent;
