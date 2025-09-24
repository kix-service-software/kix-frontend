/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { TicketContext, QueueService } from '../../core';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

export class Component extends AbstractMarkoComponent<ComponentState, TicketContext> {

    private subscriber: IEventSubscriber;

    public listenerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('ticket-queue-explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);
        await this.loadQueues(this.context);

        this.state.myTeamsActive = this.context?.queueId === 0;

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                if (this.context?.queueId) {
                    this.state.activeNode = this.getActiveNode(this.context?.queueId);
                } else {
                    this.state.activeNode = undefined;
                    this.state.myTeamsActive = this.context?.queueId === 0;
                }
            }
        };

        this.state.activeNode = this.getActiveNode(this.context?.queueId);

        this.prepareTicketStats(this.state.nodes);

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
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

        const context = ContextService.getInstance().getActiveContext() as TicketContext;
        context.setQueue(node.id);
        context.setAdditionalInformation('STRUCTURE', this.getStructureInformation());
    }

    private getStructureInformation(node: TreeNode = this.state.activeNode): string[] {
        let info = [node.label];

        if (node.parent) {
            info = [...this.getStructureInformation(node.parent), ...info];
        }

        return info;
    }

    public async showAll(): Promise<void> {
        this.state.activeNode = null;
        const allText = await TranslationService.translate('Translatable#All');

        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof TicketContext) {
            context.setQueue(null);
        }
        context.setAdditionalInformation('STRUCTURE', [allText]);
    }

    public async showMyTeams(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof TicketContext) {
            context.setQueue(0);
        }
    }

}

module.exports = Component;
