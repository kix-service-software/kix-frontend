import { ComponentState } from './ComponentState';
import { ContextService, IdService, SearchOperator, KIXObjectService } from '@kix/core/dist/browser';
import {
    TreeNode, Queue, TreeNodeProperty, FilterCriteria,
    TicketProperty, FilterDataType, FilterType, KIXObjectType
} from '@kix/core/dist/model';
import { TicketContext } from '@kix/core/dist/browser/ticket';

export class Component {

    private state: ComponentState;

    public listenerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('search-result-explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketContext>(TicketContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const queuesHierarchy = await KIXObjectService.loadObjects<Queue>(
            KIXObjectType.QUEUE_HIERARCHY, null
        );

        this.state.nodes = this.prepareTreeNodes(queuesHierarchy);

        this.setActiveNode(context.queue);
    }

    private setActiveNode(queue: Queue): void {
        if (queue) {
            this.activeNodeChanged(this.getActiveNode(queue));
        } else {
            this.showAll();
        }
    }

    private getActiveNode(queue: Queue, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let activeNode = nodes.find((n) => n.id.QueueID === queue.QueueID);
        if (!activeNode) {
            for (let index = 0; index < nodes.length; index++) {
                activeNode = this.getActiveNode(queue, nodes[index].children);
                if (activeNode) {
                    nodes[index].expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private prepareTreeNodes(categories: Queue[]): TreeNode[] {
        return categories
            ? categories.map((q) => new TreeNode(
                q, q.Name, null, null, this.prepareTreeNodes(q.SubQueues), null, null, null, this.getTicketStats(q))
            )
            : [];
    }

    private getTicketStats(queue: Queue): TreeNodeProperty[] {
        const properties: TreeNodeProperty[] = [];
        if (queue.TicketStats) {
            const openCount = queue.TicketStats.OpenCount;
            properties.push(new TreeNodeProperty(openCount, `offene Tickets: ${openCount}`));

            const lockCount = openCount - queue.TicketStats.LockCount;
            properties.push(new TreeNodeProperty(lockCount, `nicht gesperrte Tickets: ${lockCount}`));

            const escalatedCount = queue.TicketStats.EscalatedCount;
            if (escalatedCount > 0) {
                properties.push(
                    new TreeNodeProperty(escalatedCount, `eskalierte Tickets: ${escalatedCount}`, 'escalated')
                );
            }
        }

        return properties;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;

        const queue = node.id as Queue;
        const context = await ContextService.getInstance().getContext<TicketContext>(TicketContext.CONTEXT_ID);
        context.setQueue(queue);
        context.setAdditionalInformation(this.getStructureInformation());
    }

    private getStructureInformation(node: TreeNode = this.state.activeNode): string[] {
        const queue = (node.id as Queue);
        let info = [queue.Name];

        if (node.parent) {
            info = [...this.getStructureInformation(node.parent), ...info];
        }

        return info;
    }

    public async showAll(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketContext>(TicketContext.CONTEXT_ID);
        this.state.activeNode = null;
        context.setQueue(null);
        context.setAdditionalInformation(['Alle']);
    }

}

module.exports = Component;
