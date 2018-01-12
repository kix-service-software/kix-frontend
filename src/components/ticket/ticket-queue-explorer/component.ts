import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ContextStore } from '@kix/core/dist/browser/context/ContextStore';
import { ContextFilter, Queue, TicketProperty } from '@kix/core/dist/model';
import { TicketQueueExplorerComponentState } from './model/TicketQueueExplorerComponentState';
import { TreeNode } from '@kix/core/dist/browser/model';

export class QueueExplorerComponent {

    private state: TicketQueueExplorerComponentState;

    public onCreate(input: any): void {
        this.state = new TicketQueueExplorerComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);

        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));

        this.ticketStateChanged();
    }

    private ticketStateChanged(): void {
        const ticketData = TicketService.getInstance().getTicketData();
        if (ticketData && ticketData.queuesHierarchy) {
            this.state.tree = this.prepareTree(ticketData.queuesHierarchy);
        } else {
            this.state.tree = [];
        }
    }

    private prepareTree(hierarchy: Queue[]): TreeNode[] {
        const nodes = [];
        hierarchy.forEach((queue: Queue) => {
            if (queue.hasOwnProperty('Name')) {
                let subNodes = [];
                if (queue.hasOwnProperty('SubQueues')) {
                    subNodes = this.prepareTree(queue.SubQueues);
                }
                const treeNode = new TreeNode(
                    queue.QueueID,
                    queue.Name,
                    subNodes,
                    [] // TODO: Ticketanzahlen ermitteln, falls aktiviert
                );
                nodes.push(treeNode);
            }
        });
        return nodes;
    }

    private isConfigMode(): boolean {
        return true;
    }

    private queueClicked(queueId: number): void {
        // TODO: Constant enum for ObjectType Queue
        const contextFilter = new ContextFilter('Queue', TicketProperty.QUEUE_ID, queueId);
        ContextStore.getInstance().provideObjectFilter(contextFilter);
    }
}

module.exports = QueueExplorerComponent;
