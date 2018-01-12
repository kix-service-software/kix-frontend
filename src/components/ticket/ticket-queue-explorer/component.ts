import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { ObjectType, ContextFilter, TicketProperty } from '@kix/core/dist/model/';

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
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const ticketData = TicketService.getInstance().getTicketData();
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
        const contextFilter =
            new ContextFilter('queue-explorer', 'queue-explorer', ObjectType.QUEUE, TicketProperty.QUEUE_ID, queueId);

        ContextService.getInstance().provideContextFilter(contextFilter);
    }

}

module.exports = QueueExplorerComponent;
