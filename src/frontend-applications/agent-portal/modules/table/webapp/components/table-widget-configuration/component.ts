/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        this.state.isSortEnabled = Array.isArray(this.state.configuration.sort);
        if (this.state.isSortEnabled) {
            this.state.isDESC = this.state.configuration.sort[1] === SortOrder.DOWN;
        }

        const tableConfiguration = this.state.configuration.configuration as TableConfiguration;
        const columns = tableConfiguration?.tableColumns;
        const nodes: TreeNode[] = [];
        if (Array.isArray(columns)) {
            for (const c of columns) {
                const label = await LabelService.getInstance().getPropertyText(
                    c.property, tableConfiguration.objectType
                );
                nodes.push(new TreeNode(c.property, label));
            }
        }

        this.sortColumnTreeHandler = TreeService.getInstance().getTreeHandler(this.state.sortTreeId);
        if (this.sortColumnTreeHandler) {
            this.sortColumnTreeHandler.setTree(nodes, null, true);
            const selectedNode = this.state.isSortEnabled
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

    public switchSort(): void {
        if (this.state.isSortEnabled) {
            this.state.configuration.sort = null;
        } else {
            const columnSelection = this.sortColumnTreeHandler.getSelectedNodes();
            if (Array.isArray(columnSelection) && columnSelection.length) {
                this.state.configuration.sort = [
                    columnSelection[0].id,
                    this.state.isDESC ? SortOrder.DOWN : SortOrder.UP
                ];
            }
        }

        this.state.isSortEnabled = Array.isArray(this.state.configuration.sort);
        this.emitConfigurationChanged();
    }

    public sortColumnChanged(nodes: TreeNode[]): void {
        if (Array.isArray(nodes) && nodes.length && this.state.isSortEnabled) {
            this.state.configuration.sort[0] = nodes[0].id;
            this.emitConfigurationChanged();
        }
    }

    public sortOrderChanged(): void {
        if (this.state.isSortEnabled) {
            this.state.configuration.sort[1] = this.state.configuration.sort[1] === SortOrder.DOWN
                ? SortOrder.UP
                : SortOrder.DOWN;
            this.emitConfigurationChanged();
        }
    }

}

module.exports = Component;
