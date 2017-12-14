import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';

export class QueueExplorerComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            widgetConfiguration: null,
            queues: []
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);

        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
    }

    private ticketStateChanged(): void {
        const ticketData = TicketStore.getInstance().getTicketData('ticket-table-data');
        if (ticketData && ticketData.queues) {
            this.state.queues = ticketData.queues;
        } else {
            this.state.queues = [];
        }
    }

    private isConfigMode(): boolean {
        return true;
    }

    private queueClicked(queueId: number): void {
        console.log("Queue selected: " + queueId);
    }

}

module.exports = QueueExplorerComponent;
