/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../../model/configuration/ConfigurationType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { IdService } from '../../../../../model/IdService';
import { SortOrder } from '../../../../../model/SortOrder';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TreeHandler, TreeNode, TreeService, TreeUtil } from '../../../../base-components/webapp/core/tree';
import { TableFactoryService } from '../../core/factory/TableFactoryService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (!this.state.configuration) {
            this.state.configuration = { ...input.configuration };
        }
    }

    public async onMount(): Promise<void> {

        let tableConfiguration = this.state.configuration.configuration as TableConfiguration;

        if (!tableConfiguration) {
            const table = await TableFactoryService.getInstance().createTable(
                IdService.generateDateBasedId(), this.state.configuration.objectType
            );
            tableConfiguration = table.getTableConfiguration();
            this.state.configuration.configuration = tableConfiguration;
        }

        if (!tableConfiguration?.tableColumns?.length) {
            const factory = TableFactoryService.getInstance().getTableFactory(this.state.configuration.objectType);
            tableConfiguration.tableColumns = await factory.getDefaultColumnConfigurations(null);
        }

        this.state.tableConfigurationTemplate = KIXModulesService.getConfigurationComponentTemplate(
            ConfigurationType.Table
        );

        this.updateSortConfiguration();

        this.state.prepared = true;
    }

    private async updateSortConfiguration(): Promise<void> {
        const sortColumnTreeHandler = new TreeHandler();
        sortColumnTreeHandler.setMultiSelect(false);
        TreeService.getInstance().registerTreeHandler(this.state.sortTreeId, sortColumnTreeHandler);

        if (Array.isArray(this.state.configuration.sort)) {
            this.state.isDESC = this.state.configuration.sort[1] === SortOrder.DOWN;
        }

        const supportedAttributes = await KIXObjectService.getSortableAttributes(this.state.configuration.objectType);
        let nodes: TreeNode[] = [];
        if (Array.isArray(supportedAttributes)) {
            const labelPromises: Array<Promise<string>> = supportedAttributes.map((sa) =>
                LabelService.getInstance().getPropertyText(sa.Property, this.state.configuration.objectType)
            );
            const labels = await Promise.all(labelPromises);
            nodes = labels.map((l, index) => new TreeNode(supportedAttributes[index].Property, l));
        }

        nodes = nodes.sort((a, b) => a.label.localeCompare(b.label));

        if (sortColumnTreeHandler) {
            sortColumnTreeHandler.setTree(nodes, null, true);
            const selectedNode = Array.isArray(this.state.configuration.sort)
                ? TreeUtil.findNode(nodes, this.state.configuration.sort[0])
                : nodes[0];
            sortColumnTreeHandler.setSelection([selectedNode], true);
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
