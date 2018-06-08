import { TicketInfoComponentState } from './TicketInfoComponentState';
import { TicketService, TicketLabelProvider } from "@kix/core/dist/browser/ticket";
import { ContextService, AbstractContextServiceListener } from '@kix/core/dist/browser/context';
import { SysconfigUtil, ObjectIcon, Context } from '@kix/core/dist/model';
import { ActionFactory } from '@kix/core/dist/browser';

class TicketInfoWidgetComponent {

    private state: TicketInfoComponentState;

    public onCreate(input: any): void {
        this.state = new TicketInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.labelProvider = new TicketLabelProvider();
        ContextService.getInstance().registerListener(new ComponentContextServiceListener(this));
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener({
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

    private ticketStateChanged(): void {
        this.getTicket();
    }

    public getTicket(): void {
        const context = ContextService.getInstance().getActiveContext();
        if (context.objectId) {
            this.state.ticket = TicketService.getInstance().getTicket(Number(context.objectId));
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

// tslint:disable-next-line:max-classes-per-file
class ComponentContextServiceListener extends AbstractContextServiceListener {

    public constructor(private component: TicketInfoWidgetComponent) {
        super();
    }

    public objectUpdated(): void {
        this.component.getTicket();
    }

}

module.exports = TicketInfoWidgetComponent;
