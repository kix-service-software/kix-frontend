import { ComponentState } from './ComponentState';
import { TicketLabelProvider } from "@kix/core/dist/browser/ticket";
import { ContextService } from '@kix/core/dist/browser/context';
import { SysconfigUtil, ObjectIcon, KIXObjectType, Ticket, ContextMode } from '@kix/core/dist/model';
import { ActionFactory, IdService } from '@kix/core/dist/browser';

class Component {

    private state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('ticket-info-');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.labelProvider = new TicketLabelProvider();
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener(this.contextListernerId, {
            sidebarToggled: () => { (this as any).setStateDirty('ticket'); },
            explorerBarToggled: () => { (this as any).setStateDirty('ticket'); },
            objectChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.getTicket();
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, this.state.ticket
            );
        }
    }

    public async getTicket(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context.objectId) {
            const ticketsResponse = await ContextService.getInstance().loadObjects<Ticket>(
                KIXObjectType.TICKET, [context.objectId], ContextMode.DETAILS, null
            );

            this.state.ticket = ticketsResponse && ticketsResponse.length ? ticketsResponse[0] : null;
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

    // FIXME: Das Widget sollte eigentlich nichts von Sidebar und Explorer Wissen müssen.
    // Das Styling sollte sich an Hand des verfügbaren Platzes anpassen
    private isExplorerAndSidebarShown(): boolean {
        return ContextService.getInstance().getActiveContext()
            && ContextService.getInstance().getActiveContext().isExplorerBarShown()
            && ContextService.getInstance().getActiveContext().explorerBarExpanded
            && ContextService.getInstance().getActiveContext().isSidebarShown();
    }

    private getIcon(object: string, objectId: string): ObjectIcon {
        return new ObjectIcon(object, objectId);
    }

}

module.exports = Component;
