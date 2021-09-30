/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultColumnConfiguration } from '../../../../../../model/configuration/DefaultColumnConfiguration';
import { IColumnConfiguration } from '../../../../../../model/configuration/IColumnConfiguration';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../core/AbstractMarkoComponent';
import { KIXObjectService } from '../../../core/KIXObjectService';
import { LabelService } from '../../../core/LabelService';
import { TreeHandler, TreeNode, TreeService } from '../../../core/tree';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private dragColumn: IColumnConfiguration;
    private propertyTreeHandler: TreeHandler;
    private objectType: KIXObjectType;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.columns = Array.isArray(input.columns) ? [...input.columns] : [];
        this.objectType = input.objectType;
        this.updateColumnNames();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject(
            [
                'Translatable#Some Translation',
                'Translatable#Add Column(s)',
                'Translatable#Property',
                'Translatable#Text',
                'Translatable#Icon',
                'Translatable#Column Title',
                'Translatable#Column Icon',
                'Translatable#Sortable',
                'Translatable#Filterable',
                'Translatable#Filter List',
                'Translatable#Resizable',
                'Translatable#Translatable',
                'Translatable#Translatable Title',
                'Translatable#Size (px)',
                'Translatable#Component ID',
                'Translatable#Column Title'
            ]
        );
        this.updatePropertyNodes();
    }

    private async updateColumnNames(): Promise<void> {
        this.state.loading = true;

        for (const c of this.state.columns) {
            const name = await LabelService.getInstance().getPropertyText(c.property, this.objectType);
            this.state.columnNames[c.property] = name;
        }

        this.state.loading = false;
    }

    private emitConfigurationChanged(): void {
        (this as any).emit('configurationChanged', this.state.columns);
    }

    private async updatePropertyNodes(): Promise<void> {
        const nodes: TreeNode[] = [];

        let properties = await KIXObjectService.getObjectProperties(this.objectType);
        properties = properties.filter((p) => !this.state.columns?.some((c) => c.property === p));

        for (const property of properties) {
            const text = await LabelService.getInstance().getPropertyText(property, this.objectType);
            nodes.push(new TreeNode(property, text));
        }

        this.propertyTreeHandler = TreeService.getInstance().getTreeHandler(this.state.propertyTreeId);
        if (this.propertyTreeHandler) {
            this.propertyTreeHandler.setTree(nodes, null, true);
        }
    }

    public async addColumn(): Promise<void> {
        const nodes = this.propertyTreeHandler.getSelectedNodes();
        if (Array.isArray(nodes) && nodes.length) {
            for (const n of nodes) {
                let property = n.id;
                const dynamicField = await KIXObjectService.loadDynamicField(n.id);
                if (dynamicField) {
                    property = `DynamicFields.${property}`;
                }
                const column = new DefaultColumnConfiguration(null, null, null, property);
                column.filterable = true;
                column.size = 200;
                this.state.columns.push(column);
            }

            this.propertyTreeHandler.selectNone();
            await this.updatePropertyNodes();
            this.emitConfigurationChanged();
            this.updateColumnNames();
        }
    }

    public async removeColumn(column: IColumnConfiguration): Promise<void> {
        const index = this.state.columns.findIndex((c) => c.property === column.property);
        if (index !== -1) {
            this.state.columns.splice(index, 1);

            await this.updatePropertyNodes();
            this.emitConfigurationChanged();
            (this as any).setStateDirty('columns');
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
        const newPosition = this.state.columns.findIndex((c) => column.property === c.property);
        const oldPosition = this.state.columns.findIndex((c) => this.dragColumn.property === c.property);

        this.state.columns[oldPosition] = column;
        this.state.columns[newPosition] = this.dragColumn;

        this.emitConfigurationChanged();
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
