import { ComponentState } from './ComponentState';
import { ContextService, IdService } from '../../../../core/browser';
import { TreeNode, Queue, TreeNodeProperty } from '../../../../core/model';
import { TicketContext, TicketService } from '../../../../core/browser/ticket';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

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
        await this.loadQueues(context);
    }

    private async loadQueues(context: TicketContext): Promise<void> {
        this.state.nodes = null;
        const queuesHierarchy = await TicketService.getInstance().getQueuesHierarchy();
        this.state.nodes = await this.prepareTreeNodes(queuesHierarchy);
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

    private async prepareTreeNodes(categories: Queue[]): Promise<TreeNode[]> {
        const nodes = [];
        if (categories) {
            for (const q of categories) {
                const name = await TranslationService.translate(q.Name);
                const subQueues = await this.prepareTreeNodes(q.SubQueues);
                const ticketStats = await this.getTicketStats(q);
                nodes.push(new TreeNode(
                    q, name, null, null, subQueues, null, null, null, ticketStats
                ));
            }
        }
        return nodes;
    }

    private async getTicketStats(queue: Queue): Promise<TreeNodeProperty[]> {
        const properties: TreeNodeProperty[] = [];
        if (queue.TicketStats) {
            const openCount = queue.TicketStats.OpenCount;

            const openTooltip = await TranslationService.translate('Translatable#open tickets: {0}', [openCount]);
            properties.push(new TreeNodeProperty(openCount, openTooltip));

            const lockCount = openCount - queue.TicketStats.LockCount;
            const lockedTooltip = await TranslationService.translate('Translatable#free tickets: {0}', [lockCount]);
            properties.push(new TreeNodeProperty(lockCount, lockedTooltip));

            const escalatedCount = queue.TicketStats.EscalatedCount;
            if (escalatedCount > 0) {
                const escalatedTooltip = await TranslationService.translate(
                    'Translatable#escalated tickets: {0}', [escalatedCount]
                );
                properties.push(
                    new TreeNodeProperty(escalatedCount, escalatedTooltip, 'escalated')
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
        context.setAdditionalInformation('STRUCTURE', this.getStructureInformation());
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

        const allText = await TranslationService.translate('Translatable#All');

        context.setQueue(null);
        context.setAdditionalInformation('STRUCTURE', [allText]);
    }

}

module.exports = Component;
