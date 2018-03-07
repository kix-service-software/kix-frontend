import { TicketInfoComponentState } from './TicketInfoComponentState';
import { TicketService, TicketLabelProvider } from "@kix/core/dist/browser/ticket";
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
        this.state.labelProvider = new TicketLabelProvider();
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

    private ticketStateChanged(): void {
        this.getTicket();
    }

    private getTicket(): void {
        if (this.state.ticketId) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails) {
                this.state.ticket = ticketDetails.ticket;
                this.state.customer = ticketDetails.customer;
                this.state.contact = ticketDetails.contact;
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

    private getIncidentStateId(): number {
        const serviceId = this.state.ticket.ServiceID;
        let incidentStateId = 0;
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            const service = objectData.services.find((s) => s.ServiceID === serviceId);
            if (service) {
                incidentStateId = service.IncidentState.CurInciStateID;
            }
        }

        return incidentStateId;
    }

}

module.exports = TicketInfoWidgetComponent;
