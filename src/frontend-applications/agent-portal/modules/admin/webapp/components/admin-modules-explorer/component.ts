/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { AdminModuleCategory } from '../../../model/AdminModuleCategory';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        if (context) {
            this.state.filterValue = context.getAdditionalInformation('EXPLORER_FILTER_ADMIN');
            if (this.state.filterValue) {
                const filter = (this as any).getComponent('admin-modules-explorer-filter');
                if (filter) {
                    filter.textFilterValueChanged(null, this.state.filterValue);
                }
            }
            this.state.widgetConfiguration = context.getWidgetConfiguration(this.state.instanceId);

            const categories = await AdministrationSocketClient.getInstance().loadAdminCategories();

            if (categories) {
                this.state.nodes = await this.prepareCategoryTreeNodes(categories);
            }

            this.setActiveNode(context.adminModule);
        }
    }

    private setActiveNode(adminModule: AdminModule): void {
        if (adminModule) {
            this.activeNodeChanged(this.getActiveNode(adminModule));
        }
    }

    private getActiveNode(adminModule: AdminModule, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let activeNode = nodes.find((n) => n.id.id === adminModule.id);
        if (!activeNode) {
            for (const node of nodes) {
                if (node.children && node.children.length) {
                    activeNode = this.getActiveNode(adminModule, node.children);
                }
                if (activeNode) {
                    node.expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private async prepareCategoryTreeNodes(categories: AdminModuleCategory[]): Promise<TreeNode[]> {
        let nodes = [];
        if (categories) {
            for (const c of categories) {
                const categoryTreeNodes = await this.prepareCategoryTreeNodes(c.children);
                const moduleTreeNodes = await this.prepareModuleTreeNodes(c.modules);
                const name = await TranslationService.translate(c.name);
                nodes.push(new TreeNode(
                    c, name, c.icon, null, [
                    ...categoryTreeNodes,
                    ...moduleTreeNodes
                ], null, null, null, null, false, true, true)
                );
            }
        }

        nodes = this.sortNodes(nodes);
        return nodes;
    }

    private async prepareModuleTreeNodes(modules: AdminModule[]): Promise<TreeNode[]> {
        const nodes = [];
        for (const m of modules) {
            const name = await TranslationService.translate(m.name);
            nodes.push(new TreeNode(m, name, m.icon));
        }

        return nodes;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;
        if (node.id instanceof AdminModule) {
            const adminModule = node.id as AdminModule;
            const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
            if (context) {
                context.setAdminModule(adminModule, node.parent ? node.parent.label : '');
            }
        }
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        if (context) {
            context.setAdditionalInformation('EXPLORER_FILTER_ADMIN', this.state.filterValue);
        }
    }

    private sortNodes(nodes: TreeNode[]): TreeNode[] {
        return nodes.sort((a, b) => {
            if (a.children) {
                a.children = this.sortNodes(a.children);
            }
            return a.label.localeCompare(b.label);
        });
    }

}

module.exports = Component;
