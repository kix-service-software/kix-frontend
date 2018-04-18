import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { TreeNode, TreeNodeProperty, ObjectIcon } from '@kix/core/dist/model';
import { ContextFilter, ObjectType, Queue, TicketProperty } from '@kix/core/dist/model/';

import { TicketQueueExplorerComponentState } from './TicketQueueExplorerComponentState';

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

        TicketService.getInstance().addServiceListener(this.ticketStateChanged.bind(this));
        this.ticketStateChanged();
    }

    private ticketStateChanged(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.queuesHierarchy) {
            this.state.tree = this.prepareTree(objectData.queuesHierarchy);
        } else {
            this.state.tree = [];
        }
    }

    private prepareTree(hierarchy: Queue[]): TreeNode[] {
        const nodes = [];
        hierarchy.forEach((queue: Queue) => {
            if (queue.hasOwnProperty('Name')) {
                let children = [];
                if (queue.hasOwnProperty('SubQueues')) {
                    children = this.prepareTree(queue.SubQueues);
                }
                const treeNode = new TreeNode(
                    queue.QueueID,
                    queue.Name,
                    new ObjectIcon(TicketProperty.QUEUE_ID, queue.QueueID),
                    children,
                    null,
                    null,
                    null,
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
}

module.exports = QueueExplorerComponent;
