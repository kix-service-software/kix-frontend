/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../../model/configuration/ConfigurationType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { SortOrder } from '../../../../../model/SortOrder';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TreeHandler, TreeNode, TreeService, TreeUtil } from '../../../../base-components/webapp/core/tree';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private sortColumnTreeHandler: TreeHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.configuration = { ...input.configuration };
        this.updateSortConfiguration();
    }

    public async onMount(): Promise<void> {
        this.state.tableConfigurationTemplate = KIXModulesService.getConfigurationComponentTemplate(
            ConfigurationType.Table
        );
        this.updateSortConfiguration();
    }

    private async updateSortConfiguration(): Promise<void> {
        if (Array.isArray(this.state.configuration.sort)) {
            this.state.isDESC = this.state.configuration.sort[1] === SortOrder.DOWN;
        }

        const tableConfiguration = this.state.configuration.configuration as TableConfiguration;
        const supportedAttributes = await KIXObjectService.getSortableAttributes(tableConfiguration.objectType);
        let nodes: TreeNode[] = [];
        if (Array.isArray(supportedAttributes)) {
            const labelPromises = [];
            for (const sA of supportedAttributes) {
                labelPromises.push(
                    new Promise<void>(async (resolve) => {
                        const label = await LabelService.getInstance().getPropertyText(
                            sA.Property, tableConfiguration.objectType
                        );
                        nodes.push(new TreeNode(sA.Property, label));
                        resolve();
                    })
                );
            }
            await Promise.all(labelPromises);
        }
        nodes = nodes.sort((a, b) => a.label.localeCompare(b.label));

        this.sortColumnTreeHandler = TreeService.getInstance().getTreeHandler(this.state.sortTreeId);
        if (this.sortColumnTreeHandler) {
            this.sortColumnTreeHandler.setTree(nodes, null, true);
            const selectedNode = Array.isArray(this.state.configuration.sort)
                ? TreeUtil.findNode(nodes, this.state.configuration.sort[0])
                : nodes[0];
            this.sortColumnTreeHandler.setSelection([selectedNode], true);
        }
    }

    private emitConfigurationChanged(): void {
        (this as any).emit('configurationChanged', this.state.configuration);
    }

    public configurationChanged(configuration: TableConfiguration): void {
        this.state.configuration.configuration = configuration;
        this.emitConfigurationChanged();
    }

    public showFilterChanged(): void {
        this.state.configuration.showFilter = !this.state.configuration.showFilter;
        this.emitConfigurationChanged();
    }

    public sortColumnChanged(nodes: TreeNode[]): void {
        if (Array.isArray(nodes) && nodes.length) {
            this.state.configuration.sort = [
                nodes[0].id,
                this.state.configuration.sort ? this.state.configuration.sort[1] : SortOrder.UP
            ];
        } else {
            this.state.configuration.sort = null;
            this.state.isDESC = false;
        }
        this.emitConfigurationChanged();
    }

    public sortOrderChanged(): void {
        this.state.configuration.sort = [
            this.state.configuration.sort ? this.state.configuration.sort[0] : null,
            this.state.configuration.sort && this.state.configuration.sort[1] === SortOrder.DOWN ?
                SortOrder.UP : SortOrder.DOWN
        ];
        if (this.state.configuration.sort && this.state.configuration.sort[0]) {
            this.emitConfigurationChanged();
        }
    }

}

module.exports = Component;
