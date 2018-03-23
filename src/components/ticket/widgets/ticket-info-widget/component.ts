import { TicketInfoComponentState } from './TicketInfoComponentState';
import { TicketService, TicketLabelProvider } from "@kix/core/dist/browser/ticket";
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { SysconfigUtil } from '@kix/core/dist/model';
import { ActionFactory } from '@kix/core/dist/browser';

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
        this.setActions();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.getTicket();
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, this.state.ticket
            );
        }
    }

    private ticketStateChanged(): void {
        this.getTicket();
    }

    private getTicket(): void {
        if (this.state.ticketId) {
            this.state.ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (this.state.ticket) {
                this.state.isPending = this.state.ticket.hasPendingState();
                this.state.isAccountTimeEnabled = SysconfigUtil.isTimeAccountingEnabled();
            }
        }
    }

    private print(): void {
        alert('Drucken ...');
    }

    private edit(): void {
        alert('Bearbeiten ...');
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
