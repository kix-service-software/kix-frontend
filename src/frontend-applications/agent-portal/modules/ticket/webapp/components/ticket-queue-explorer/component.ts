/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TicketContext, QueueService } from '../../core';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { Context } from '../../../../../model/Context';

export class Component extends AbstractMarkoComponent<ComponentState, TicketContext> {

    public onCreate(input: any): void {
        super.onCreate(input, 'ticket-queue-explorer');
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);
        await this.loadQueues(this.context);
        await this.showMyTeams();
        this.state.myTeamsActive = this.context?.queueId === 0;

        this.state.activeNode = this.getActiveNode(this.context?.queueId);

        this.prepareTicketStats(this.state.nodes);

        super.registerEventSubscriber(
            function (data: Context, eventId: string): void {
                if (data?.instanceId !== this.contextInstanceId) return;
                if (this.context?.queueId) {
                    this.state.activeNode = this.getActiveNode(this.context?.queueId);
                } else {
                    this.state.activeNode = undefined;
                    this.state.myTeamsActive = this.context?.queueId === 0;
                }
            },
            [ContextEvents.CONTEXT_PARAMETER_CHANGED]
        );
    }

    public nodeToggled(node: TreeNode): void {
        if (node?.expanded && node.children?.length) {
            setTimeout(() => this.prepareTicketStats(node.children), 250);
        }
    }

    private async prepareTicketStats(nodes: TreeNode[]): Promise<void> {
        const ticketStats = await QueueService.loadTicketStats(nodes.map((n) => n.id));
        for (const ts of ticketStats) {
            const subNode = nodes.find((n) => n.id === ts.QueueID);
            QueueService.prepareTicketStats(ts, subNode, this.state.treeId);
        }
    }

    private async loadQueues(context: TicketContext): Promise<void> {
        this.state.nodes = null;
        const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(null, ['READ']);
        this.state.nodes = await QueueService.getInstance().prepareObjectTree(
            queuesHierarchy, true, false, null, undefined, true
        );
    }


    private getActiveNode(queueId: number, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let activeNode = nodes?.find((n) => n.id === queueId);
        if (!activeNode) {
            for (const node of nodes) {
                activeNode = this.getActiveNode(queueId, node.children);
                if (activeNode) {
                    node.expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;

        this.context.setQueue(node.id);
        this.context.setAdditionalInformation('STRUCTURE', this.getStructureInformation());
    }

    private getStructureInformation(node: TreeNode = this.state.activeNode): string[] {
        let info = [node.label];

        if (node.parent) {
            info = [...this.getStructureInformation(node.parent), ...info];
        }

        return info;
    }

    public async showMyTeams(): Promise<void> {
        this.context.setQueue(0);
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
