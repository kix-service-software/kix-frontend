/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketContext, QueueService } from '../../core';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';

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
        const context = ContextService.getInstance().getActiveContext() as TicketContext;
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;
        await this.loadQueues(context);
    }

    private async loadQueues(context: TicketContext): Promise<void> {
        this.state.nodes = null;
        const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy();
        this.state.nodes = await QueueService.getInstance().prepareObjectTree(queuesHierarchy, true, false, null, true);

        if (context.queueId) {
            this.state.activeNode = this.getActiveNode(context.queueId);
        } else {
            this.showAll();
        }
    }


    private getActiveNode(queueId: number, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let activeNode = nodes.find((n) => n.id === queueId);
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

}

module.exports = Component;
