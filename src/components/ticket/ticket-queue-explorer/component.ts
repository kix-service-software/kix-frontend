import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { ContextStore } from '@kix/core/dist/browser/context/ContextStore';
import { ContextFilter, TicketProperty } from '@kix/core/dist/model/';
import { Queue } from '@kix/core/dist/model/Queue';
import { TreeNode } from '../../_base-components/tree/tree-node/model/TreeNode';

export class QueueExplorerComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            widgetConfiguration: null,
            queues: [],
            tree: []
        };
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
        console.log(ticketData);
        const fakeQueuesHierarchy = [
            { QueueID: 1 },
            { QueueID: 2 },
            { QueueID: 3 },
            { QueueID: 4 },
            {
                QueueID: 407,
                SubQueues: [
                    {
                        QueueID: 408,
                        SubQueues: [
                            {
                                QueueID: 409,
                                SubQueues: [
                                    {
                                        QueueID: 410
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        QueueID: 411,
                        SubQueues: [
                            {
                                QueueID: 412,
                                SubQueues: [
                                    {
                                        QueueID: 413
                                    },
                                    {
                                        QueueID: 414,
                                        SubQueues: [
                                            {
                                                QueueID: 415
                                            },
                                            {
                                                QueueID: 416
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];
        if (ticketData) {
            ticketData.queuesHierarchy = fakeQueuesHierarchy;
        }
        if (ticketData && ticketData.queues && ticketData.queuesHierarchy) {
            this.state.queues = ticketData.queues;
            this.state.tree = this.prepareTree(ticketData.queuesHierarchy);
            console.log(this.state.tree);
        } else {
            this.state.queues = [];
            this.state.tree = [];
        }
    }

    // TODO: hierarchy eigentlich vom Typ Queue[]? aber SubQueues ist da nicht enthalten
    private prepareTree(hierarchy: any[]): any[] {
        const tree = [];
        hierarchy.forEach((queue: any) => {
            const queueObject = this.state.queues.find((q) => q.QueueID === queue.QueueID);
            if (queueObject && queueObject.hasOwnProperty('Name')) {
                let subNodes = [];
                if (queue.hasOwnProperty('SubQueues')) {
                    subNodes = this.prepareTree(queue.SubQueues);
                }
                const groupElement = new TreeNode(
                    queue.QueueID,
                    queueObject.Name,
                    subNodes,
                    [] // TODO: Ticketanzahlen ermitteln, falls aktiviert
                );
                tree.push(groupElement);
            }
        });
        return tree;
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
