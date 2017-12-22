import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ContextStore } from '@kix/core/dist/browser/context/ContextStore';
import { ContextFilter, TicketProperty } from '@kix/core/dist/model/';

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
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);

        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
        this.ticketStateChanged();
    }

    private ticketStateChanged(): void {
        const ticketData = TicketStore.getInstance().getTicketData('ticket-table-data');
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
        // TODO: Constant enum for ObjectType Queue
        const contextFilter = new ContextFilter('Service', TicketProperty.SERVICE_ID, serviceId);
        ContextStore.getInstance().provideObjectFilter(contextFilter);
    }

}

module.exports = ServiceExplorerComponent;
