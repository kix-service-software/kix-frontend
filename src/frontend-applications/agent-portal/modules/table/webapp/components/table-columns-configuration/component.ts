/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../core/factory/TableFactoryService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TreeHandler, TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private dragColumn: IColumnConfiguration;
    private propertyTreeHandler: TreeHandler;
    private dependencyTreeHandler: TreeHandler;
    private objectType: KIXObjectType;
    private columns: IColumnConfiguration[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.columns = Array.isArray(input.columns) ? [...input.columns] : [];
        this.objectType = input.objectType;
        this.updateColumnNames();
        this.filterColumns();
    }

    public async onMount(): Promise<void> {
        this.columns = [];
        this.state.translations = await TranslationService.createTranslationObject(
            [
                'Translatable#Some Translation', 'Translatable#Add Column(s)', 'Translatable#Property',
                'Translatable#Text', 'Translatable#Icon', 'Translatable#Column Title',
                'Translatable#Column Icon', 'Translatable#Sortable', 'Translatable#Filterable',
                'Translatable#Filter List', 'Translatable#Resizable', 'Translatable#Translatable',
                'Translatable#Translatable Title', 'Translatable#Size (px)', 'Translatable#Component ID',
                'Translatable#Column Title', 'Translatable#Dependency', 'Translatable#RTL'
            ]
        );

        if (!this.columns?.length) {
            const tableFactory = TableFactoryService.getInstance().getTableFactory(this.objectType);
            this.columns = await tableFactory.getDefaultColumnConfigurations();
        }

        await this.updateDependencyNodes();
        await this.updateColumnNames();
        await this.updatePropertyNodes();

        this.filterColumns();
    }

    private async updateColumnNames(): Promise<void> {
        this.state.loading = true;

        const dependencies = await KIXObjectService.getObjectDependencies(this.objectType);
        this.state.dependencyName = await KIXObjectService.getObjectDependencyName(this.objectType);

        for (const c of this.columns) {
            let prop = c.property;
            if (!prop.startsWith('DynamicFields.') && prop.indexOf('.') !== -1) {

                const dep = prop.substring(0, prop.indexOf('.'));
                const dependency = dependencies.find((d) => d.ObjectId.toString() === dep);
                const text = await LabelService.getInstance().getObjectText(dependency);
                this.state.columnDependencyNames[c.property] = text;

                prop = prop.substring(prop.indexOf('.') + 1, prop.length);
            }
            const name = await LabelService.getInstance().getPropertyText(prop, this.objectType);
            this.state.columnNames[c.property] = name;
        }

        this.state.loading = false;
    }

    private emitConfigurationChanged(): void {
        (this as any).emit('configurationChanged', this.columns);
    }

    private async updatePropertyNodes(): Promise<void> {
        const nodes: TreeNode[] = [];

        const dependencyNodes = this.dependencyTreeHandler.getSelectedNodes();
        const dependencyIds = dependencyNodes.map((d) => d.id);

        let properties = await KIXObjectService.getObjectProperties(this.objectType, dependencyIds);
        properties = properties.filter((p) => !this.columns?.some((c) => c.property === p));

        for (const property of properties) {
            const text = await LabelService.getInstance().getPropertyText(property, this.objectType);
            if (!nodes.some((n) => n.id === property)) {
                nodes.push(new TreeNode(property, text));
            }
        }

        nodes.sort((a, b) => a.label.localeCompare(b.label));

        this.propertyTreeHandler = TreeService.getInstance().getTreeHandler(this.state.propertyTreeId);
        if (this.propertyTreeHandler) {
            this.propertyTreeHandler.setTree(nodes, null, true);
        }
    }

    private async updateDependencyNodes(): Promise<void> {
        const nodes: TreeNode[] = [];

        const dependencies = await KIXObjectService.getObjectDependencies(this.objectType);

        for (const dependency of dependencies) {
            const text = await LabelService.getInstance().getObjectText(dependency);
            nodes.push(new TreeNode(dependency.ObjectId, text));
            this.state.columnDependencyNames[dependency.ObjectId] = text;
        }
        nodes.sort((a, b) => a.label.localeCompare(b.label));

        this.dependencyTreeHandler = TreeService.getInstance().getTreeHandler(this.state.dependencyTreeId);
        if (this.dependencyTreeHandler) {
            this.dependencyTreeHandler.setTree(nodes, null, true);

            this.dependencyTreeHandler.registerSelectionListener('dependencyTree', async (node: TreeNode[]) => {
                await this.updatePropertyNodes();
                this.filterColumns();
            });
        }
    }

    private filterColumns(): void {
        const dependencyNodes = this.dependencyTreeHandler?.getSelectedNodes() || [];
        const dependencies = dependencyNodes.map((d) => d.id);

        const columns = [];
        if (this.columns) {
            if (dependencies.length === 0) {
                columns.push(...this.columns);
            } else {
                for (const dep of dependencies) {
                    columns.push(...this.columns.filter((c) => c.property.startsWith(`${dep}.`)));
                }
            }
        }

        this.state.columns = columns;
    }

    public async addColumn(): Promise<void> {
        const properties = this.propertyTreeHandler.getSelectedNodes() || [];
        const dependencies = this.dependencyTreeHandler.getSelectedNodes() || [];
        for (const propertyNode of properties) {

            const column = await this.createColumn(propertyNode.id);

            if (dependencies?.length) {
                for (const depNode of dependencies) {
                    const clone = JSON.parse(JSON.stringify(column)) as IColumnConfiguration;
                    clone.property = `${depNode.id}.${propertyNode.id}`;

                    this.state.columnDependencyNames[`${depNode.id}.${propertyNode.id}`] = depNode.label;

                    if (!this.columns.some((c) => c.property === clone.property)) {
                        this.columns.push(clone);
                    }
                }
            } else if (!this.columns.some((c) => c.property === column.property)) {
                this.columns.push(column);
            }

            this.propertyTreeHandler.selectNone();
            await this.updatePropertyNodes();
            this.emitConfigurationChanged();
            await this.updateColumnNames();
            this.filterColumns();
        }
    }

    private async createColumn(property: string): Promise<IColumnConfiguration> {
        let column = TableFactoryService.getInstance().getDefaultColumnConfiguration(
            this.objectType, property
        );

        const dynamicField = await KIXObjectService.loadDynamicField(property);
        if (dynamicField) {
            column.property = `DynamicFields.${property}`;
        }

        if (!column) {
            column = new DefaultColumnConfiguration(null, null, null, property);
            column.filterable = true;
            column.size = 200;
        }

        return column;
    }

    public async removeColumn(column: IColumnConfiguration): Promise<void> {
        const index = this.columns.findIndex((c) => c.property === column.property);
        if (index !== -1) {
            this.columns.splice(index, 1);

            await this.updatePropertyNodes();
            this.emitConfigurationChanged();
            (this as any).setStateDirty('columns');
            this.filterColumns();
        }
    }

    public rowDragstart(column: IColumnConfiguration, event: any): void {
        this.dragColumn = column;
        event.stopPropagation();
    }

    public rowDroped(column: IColumnConfiguration, event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

    public rowDragover(column: IColumnConfiguration, event: any): void {
        const newPosition = this.columns.findIndex((c) => column.property === c.property);
        const oldPosition = this.columns.findIndex((c) => this.dragColumn.property === c.property);

        this.columns[oldPosition] = column;
        this.columns[newPosition] = this.dragColumn;

        this.emitConfigurationChanged();
        this.state.columns = this.columns;
        (this as any).setStateDirty('columns');

        event.stopPropagation();
    }

    public columnSizeChanged(column: IColumnConfiguration, event: any): void {
        column.size = Number(event.target.value);
        this.emitConfigurationChanged();
    }

    public booleanValueChanged(property: string, column: IColumnConfiguration): void {
        column[property] = !column[property];
        this.emitConfigurationChanged();
        (this as any).setStateDirty('columns');
    }

    public stringValueChanged(property: string, column: IColumnConfiguration, event: any): void {
        column[property] = event.target.value;
        this.emitConfigurationChanged();
    }

}
module.exports = Component;
