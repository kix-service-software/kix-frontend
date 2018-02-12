import { TicketInfoComponentState } from './model/TicketInfoComponentState';
import { TicketService } from "@kix/core/dist/browser/ticket";
import { TicketUtil } from '@kix/core/dist/browser/ticket/TicketUtil';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';

class TicketInfoWidgetComponent {

    private state: TicketInfoComponentState;

    public onCreate(input: any): void {
        this.state = new TicketInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
        this.getTicket();
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
        } else if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.getTicket();
        }
    }

    private ticketStateChanged(): void {
        this.getTicket();
    }

    private getTicket(): void {
        if (this.state.ticketId) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails) {
                this.state.ticket = ticketDetails.ticket;
                this.state.isPending = TicketUtil.isPendingState(this.state.ticket.StateID);
                this.state.isAccountTimeEnabled = TicketUtil.isAccountTimeEnabled();
            }
        }
    }

    private print(): void {
        alert('Drucken ...');
    }

    private edit(): void {
        alert('Bearbeiten ...');
    }

    private getTemplate(componentId: string): any {
        return ClientStorageHandler.getComponentTemplate(componentId);
    }

}

module.exports = TicketInfoWidgetComponent;
