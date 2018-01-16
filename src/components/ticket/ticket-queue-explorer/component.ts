import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { ObjectType, Queue, ContextFilter, TicketProperty } from '@kix/core/dist/model/';
import { TicketQueueExplorerComponentState } from './model/TicketQueueExplorerComponentState';
import { TreeNode, TreeNodeProperty } from '@kix/core/dist/browser/model';

export class QueueExplorerComponent {

    private state: TicketQueueExplorerComponentState;

    public onCreate(input: any): void {
        this.state = new TicketQueueExplorerComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));
        this.ticketStateChanged();
    }

    private ticketStateChanged(): void {
        const ticketData = ContextService.getInstance().getObject(TicketService.TICKET_DATA_ID);
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
                    // TODO: Ticketanzahlen ermitteln, falls aktiviert und 0 (bei 'escalated') rausfiltern
                    [
                        new TreeNodeProperty(Math.floor(Math.random() * 100), 'total'),
                        new TreeNodeProperty(Math.floor(Math.random() * 100), 'unlocked'),
                        new TreeNodeProperty(Math.floor(Math.random() * 100), 'escalated', 'escalated'),
                    ]
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
        const contextFilter =
            new ContextFilter('queue-explorer', 'queue-explorer', ObjectType.QUEUE, TicketProperty.QUEUE_ID, queueId);

        ContextService.getInstance().provideContextFilter(contextFilter);
    }
}

module.exports = QueueExplorerComponent;
