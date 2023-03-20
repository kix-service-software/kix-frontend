/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';

export class Component {

    private state: ComponentState;
    private subscriber: IEventSubscriber;
    private contextListenerId: string;
    private context: TicketContext;

    public listenerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('ticket-queue-explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext<TicketContext>();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);
        await this.loadQueues(this.context);

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                this.state.activeNode = this.getActiveNode(this.context?.queueId);
            }
        };

        this.state.activeNode = this.getActiveNode(this.context?.queueId);

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);

        this.contextListenerId = IdService.generateDateBasedId('ticket-queue-explorer');
        this.context.registerListener(this.contextListenerId, {
            filteredObjectListChanged: async () => null,
            additionalInformationChanged: (key: string, value: any) => {
                if (key === AdditionalContextInformation.LOADING) {
                    BrowserUtil.toggleLoadingShield('ticket-queue-explorer', value);
                }
            },
            objectChanged: () => null,
            objectListChanged: () => null,
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null
        });
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    private async loadQueues(context: TicketContext): Promise<void> {
        this.state.nodes = null;
        const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(true, null, ['READ']);
        this.state.nodes = await QueueService.getInstance().prepareObjectTree(
            queuesHierarchy, true, false, null, undefined, true, true
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

}

module.exports = Component;
