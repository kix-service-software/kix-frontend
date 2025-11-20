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
import { AdministrationSocketClient } from '../../core/AdministrationSocketClient';
import { AdminContext } from '../../core/AdminContext';
import { AdminModule } from '../../../model/AdminModule';
import { TreeNode, TreeUtil } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { Context } from '../../../../../model/Context';

class Component extends AbstractMarkoComponent<ComponentState, AdminContext> {

    public onCreate(input: any): void {
        super.onCreate(input, 'admin-modules-explorer');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.contextType = input.contextType;
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.filterValue = this.context?.getAdditionalInformation('EXPLORER_FILTER_ADMIN');
        if (this.state.filterValue) {
            const filter = (this as any).getComponent('admin-modules-explorer-filter');
            if (filter) {
                filter.textFilterValueChanged(null, this.state.filterValue);
            }
        }
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        const categories = await AdministrationSocketClient.getInstance().loadAdminCategories();

        if (categories) {
            await this.prepareAdminTreeNodes(categories);
            this.state.nodes = TreeUtil.sortNodes(this.state.nodes);
        }

        this.state.prepared = true;

        setTimeout(() => {
            this.state.activeNode = this.getActiveNode(this.context?.adminModuleId);
        }, 500);

        super.registerEventSubscriber(
            function (data: Context, eventId: string): void {
                if (data?.instanceId === this.contextInstanceId) {
                    this.state.activeNode = this.getActiveNode(this.context?.adminModuleId);
                }
            },
            [ContextEvents.CONTEXT_PARAMETER_CHANGED]
        );

    }

    public onDestroy(): void {
        super.onDestroy();
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
        this.context.setAdminModule(node?.id);
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
        this.context.setAdditionalInformation('EXPLORER_FILTER_ADMIN', this.state.filterValue);
    }

}

module.exports = Component;
