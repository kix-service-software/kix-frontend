import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { ObjectType, ContextFilter, TicketProperty } from '@kix/core/dist/model/';

export class ServiceExplorerComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            widgetConfiguration: null,
            services: []
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        // TicketService.getInstance().addStateListener('service-explorer', this.ticketStateChanged.bind(this));
        this.ticketStateChanged();
    }

    private ticketStateChanged(): void {
        const ticketData = TicketService.getInstance().getTicketData();
        if (ticketData && ticketData.services) {
            this.state.services = ticketData.services;
        } else {
            this.state.services = [];
        }
    }

    private isConfigMode(): boolean {
        return true;
    }

    private queueClicked(serviceId: number): void {
        const contextFilter = new ContextFilter(
            'service-explorer', 'service-explorer', ObjectType.SERVICE, TicketProperty.SERVICE_ID, serviceId
        );

        ContextService.getInstance().provideContextFilter(contextFilter);
    }

}

module.exports = ServiceExplorerComponent;
