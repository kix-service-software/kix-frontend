/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { AdministrationSocketClient } from '../../core/AdministrationSocketClient';
import { AdminContext } from '../../core/AdminContext';
import { AdminModule } from '../../../model/AdminModule';
import { TreeNode, TreeUtil } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as AdminContext;
        if (context instanceof AdminContext) {
            this.state.filterValue = context.getAdditionalInformation('EXPLORER_FILTER_ADMIN');
            if (this.state.filterValue) {
                const filter = (this as any).getComponent('admin-modules-explorer-filter');
                if (filter) {
                    filter.textFilterValueChanged(null, this.state.filterValue);
                }
            }
            this.state.widgetConfiguration = await context.getWidgetConfiguration(this.state.instanceId);

            const categories = await AdministrationSocketClient.getInstance().loadAdminCategories();

            if (categories) {
                await this.prepareAdminTreeNodes(categories);
                this.state.nodes = TreeUtil.sortNodes(this.state.nodes);
            }

            this.state.prepared = true;

            setTimeout(() => {
                this.state.activeNode = this.getActiveNode(context?.adminModuleId);
            }, 500);

            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(),
                eventPublished: (data: any, eventId: string): void => {
                    this.state.activeNode = this.getActiveNode(context?.adminModuleId);
                }
            };

            EventService.getInstance().subscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    private getActiveNode(adminModuleId: string, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let activeNode = nodes.find((n) => n.id === adminModuleId);
        if (!activeNode) {
            for (const node of nodes) {
                if (node.children && node.children.length) {
                    activeNode = this.getActiveNode(adminModuleId, node.children);
                }
                if (activeNode) {
                    node.expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private async prepareAdminTreeNodes(
        modules: Array<AdminModule> = [], parent?: TreeNode
    ): Promise<void> {
        for (const m of modules) {
            const name = await TranslationService.translate(m.name);
            const node = new TreeNode(m.id, name);

            if (m.isCategory) {
                node.expandOnClick = true;
                node.icon = 'fa-solid fa-folder';
                node.flags = ['category'];
            } else {
                node.flags = ['MODULE'];
            }

            await this.prepareAdminTreeNodes(m.children, node);
            if (parent) {
                parent.children.push(node);
            } else {
                this.state.nodes.push(node);
            }
        }
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.publishToContext(node);
    }

    private async publishToContext(node: TreeNode): Promise<void> {
        this.state.activeNode = node;
        if (node) {
            const context = await ContextService.getInstance().getActiveContext();
            if (context instanceof AdminContext) {
                context.setAdminModule(node.id);
            }
        }
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof AdminContext) {
            context.setAdditionalInformation('EXPLORER_FILTER_ADMIN', this.state.filterValue);
        }
    }

}

module.exports = Component;
