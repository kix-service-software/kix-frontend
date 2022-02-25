/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { TreeHandler, TreeService, TreeNode } from '../../../core/tree';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../../../modules/base-components/webapp/core/LabelService';
import { DataType } from '../../../../../../model/DataType';
import { SortOrder } from '../../../../../../model/SortOrder';
import { KIXObject } from '../../../../../../model/kix/KIXObject';
import { SortUtil } from '../../../../../../model/SortUtil';
import { Column } from '../../../../../table/model/Column';


class Component extends AbstractMarkoComponent<ComponentState> {

    private column: Column;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (!this.column || this.column !== input.column) {
            this.column = input.column;
            this.state.filterText = null;
            this.update();
        }
    }

    private async update(): Promise<void> {
        this.state.placeholder = await TranslationService.translate('Translatable#insert filter value');

        if (this.column && this.column.getColumnConfiguration().hasListFilter) {
            const table = this.column.getTable();
            const objectType = table ? table.getObjectType() : null;
            if (objectType) {
                await this.prepareListFilter(objectType);
            }
        } else {
            this.state.hasListFilter = false;
            const filterText = this.column.getFilter()[0];
            if (filterText) {
                this.state.filterText = filterText;
            }
            setTimeout(() => {
                const inputElement = (this as any).getEl('column-filter-input');
                if (inputElement) {
                    inputElement.focus();
                    if (this.state.filterText) {
                        inputElement.selectionStart = inputElement.selectionEnd = this.state.filterText.length;
                    }
                }
            }, 100);
        }
    }

    public async onMount(): Promise<void> {
        const treeHandler = new TreeHandler([], null);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        treeHandler.registerSelectionListener(this.state.treeId, (nodes: TreeNode[]) => {
            if (this.state.hasListFilter) {
                this.column.filter(nodes.map((n) => n.id));
            }
        });
        this.state.prepared = true;
    }

    public onDestroy(): void {
        TreeService.getInstance().removeTreeHandler(this.state.treeId);
    }

    private async prepareListFilter(objectType: KIXObjectType | string): Promise<void> {
        const filterValues = this.column.getFilterValues();
        const nodes: TreeNode[] = [];
        for (const fv of filterValues) {
            const displayValue = await LabelService.getInstance().getPropertyValueDisplayText(
                objectType, this.column.getColumnId(), fv[0]
            );
            const label = `${displayValue} (${fv[1]})`;
            const icons = await LabelService.getInstance().getIconsForType(
                objectType, null, this.column.getColumnId(), fv[0]
            );
            const icon = icons && icons.length ? icons[0] : null;

            const node = new TreeNode(fv[0], label, icon, null);

            const filter = this.column.getFilter();
            const hasFilterValue = filter && filter[1] && filter[1].some(
                (f) => (f.value as []).some((v: any) => {
                    if (v instanceof KIXObject) {
                        return v.equals(fv[0]);
                    } else {
                        return v === fv[0];
                    }
                })
            );
            if (hasFilterValue) {
                node.selected = true;
            }
            nodes.push(node);
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING, SortOrder.UP);
        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes);
        }
    }

    public textFilterValueChanged(event: any): void {
        this.state.filterText = event.target.value;
    }

    public filterKeyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.state.filterText = event.target.value;
            this.filter();
        }
    }

    private filter(): void {
        if (this.column) {
            this.column.filter(null, this.state.filterText);
            (this as any).emit('closeOverlay');
        }
    }
}

module.exports = Component;
