import { ComponentState } from './ComponentState';
import { ContextService, IdService } from '@kix/core/dist/browser';
import { TreeNode, Queue } from '@kix/core/dist/model';
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

        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = this.prepareTreeNodes(objectData.queuesHierarchy);

        this.setActiveNode(context.queue);
    }

    private setActiveNode(queue: Queue): void {
        if (queue) {
            this.state.activeNode = this.getActiveNode(queue);
        }
    }

    private getActiveNode(queue: Queue, nodes: TreeNode[] = this.state.nodes
    ): TreeNode {
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
                q, this.getCategoryLabel(q), null, null, this.prepareTreeNodes(q.SubQueues))
            )
            : [];
    }

    private getCategoryLabel(queue: Queue): string {
        return `${queue.Name} (...)`;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;

        const context = await ContextService.getInstance().getContext<TicketContext>(TicketContext.CONTEXT_ID);
        context.setQueue(node.id);

        const additionalInformation = this.getStructureInformation();
        context.setAdditionalInformation(additionalInformation);
    }

    private getStructureInformation(node: TreeNode = this.state.activeNode): string {
        const queue = (node.id as Queue);
        let info = queue.Name;

        if (node.parent) {
            info = this.getStructureInformation(node.parent) + ' | ' + info;
        }

        return info;
    }

    public async showAll(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketContext>(TicketContext.CONTEXT_ID);
        this.state.activeNode = null;
        context.setQueue(null);
    }

}

module.exports = Component;
