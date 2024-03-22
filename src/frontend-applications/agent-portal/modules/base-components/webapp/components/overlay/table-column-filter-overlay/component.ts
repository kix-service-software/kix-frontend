/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectService } from '../../../core/KIXObjectService';
import { ServiceRegistry } from '../../../core/ServiceRegistry';
import { BackendSearchDataType } from '../../../../../../model/BackendSearchDataType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { DefaultDepColumnConfiguration } from '../../../../../table/model/DefaultDepColumnConfiguration';


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

        const table = this.column.getTable();
        const objectType = table ? table.getObjectType() : null;

        if (this.column.getTable().isBackendFilterSupported()) {
            if (objectType) {
                const dep = (this.column.getColumnConfiguration() as DefaultDepColumnConfiguration).dep;
                const type = await KIXObjectService.getBackendFilterType(objectType, this.column.getColumnId(), dep);
                if (type === BackendSearchDataType.TEXTUAL) {
                    this.initTextFilter();
                } else if (type === 'Autocomplete') {
                    this.prepareAutocomplete(objectType);
                } else {
                    const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
                    const property = await service.getFilterAttributeForFilter(
                        this.column.getColumnId(),
                        (this.column.getColumnConfiguration() as DefaultDepColumnConfiguration).dep
                    );
                    const nodes = await service.getTreeNodes(
                        property, true, true, undefined,
                        undefined, undefined, dep ? { dep } : undefined
                    );
                    await this.prepareListFilter(objectType, nodes);
                }
            }
        } else if (this.column && this.column.getColumnConfiguration().hasListFilter) {
            if (objectType) {
                await this.prepareListFilter(objectType);
            }
        } else {
            this.initTextFilter();
        }
    }

    private async prepareAutocomplete(objectType: string): Promise<void> {
        this.state.hasListFilter = false;
        this.state.isAutocompleteFilter = true;
        this.state.autoCompleteCallback = this.doAutocompleteSearch.bind(this);
        await this.setActiveAutocomplete(objectType);
    }

    private async setActiveAutocomplete(objectType: string): Promise<void> {
        const filter = this.column.getFilter();
        if (Array.isArray(filter) && Array.isArray(filter[1]) && filter[1][0] && Array.isArray(filter[1][0].value)) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
            if (service) {
                const dep = (this.column.getColumnConfiguration() as DefaultDepColumnConfiguration).dep;
                const nodes = await service.getTreeNodes(
                    this.column.getColumnId(), true, true, filter[1][0].value,
                    undefined, undefined, dep ? { dep } : undefined
                );
                if (nodes) {
                    nodes.forEach((n) => n.selected = true);
                    const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
                    if (treeHandler) {
                        treeHandler.setTree(nodes);
                    }
                }
            }
        }
    }

    private initTextFilter(): void {
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

    public async onMount(): Promise<void> {
        const treeHandler = new TreeHandler([], null);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        treeHandler.registerSelectionListener(this.state.treeId, (nodes: TreeNode[]) => {
            if (this.state.hasListFilter || this.state.isAutocompleteFilter) {
                this.column.filter(nodes.map((n) => n.id));
            }
        });
        this.state.prepared = true;
    }

    public onDestroy(): void {
        TreeService.getInstance().removeTreeHandler(this.state.treeId);
    }

    public async doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        let tree: TreeNode[];
        const table = this.column.getTable();
        const objectType = table ? table.getObjectType() : null;
        if (objectType) {
            const loadingOptions: KIXObjectLoadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.limit = 10;
            loadingOptions.searchLimit = 10;
            const dep = (this.column.getColumnConfiguration() as DefaultDepColumnConfiguration).dep;
            tree = await KIXObjectService.searchObjectTree(
                objectType, this.column.getColumnId(), searchValue, loadingOptions, dep ? { dep } : undefined
            );
        }

        return tree;
    }

    private async prepareListFilter(objectType: KIXObjectType | string, nodes?: TreeNode[]): Promise<void> {
        if (typeof nodes === 'undefined') {
            nodes = await this.getNodes(objectType);
        }

        this.setActiveFilterNodes(nodes);

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes);
        }
    }

    private setActiveFilterNodes(nodes: TreeNode[]): void {
        const filter = this.column.getFilter();
        if (Array.isArray(filter) && Array.isArray(filter[1])) {
            nodes.forEach((n) => {
                const hasFilterValue = filter[1].some(
                    (f) => (f.value as []).some((v: any) => {
                        if (v instanceof KIXObject) {
                            return v.equals(n.id);
                        } else {
                            return v === n.id;
                        }
                    })
                );
                if (hasFilterValue) {
                    n.selected = true;
                }
            });
        }
    }

    private async getNodes(objectType: string): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        const filterValues = this.column.getFilterValues();
        for (const fv of filterValues) {
            const displayValue = await LabelService.getInstance().getPropertyValueDisplayText(
                objectType, this.column.getColumnId(), fv[0]
            );
            const label = `${displayValue || fv[0]} (${fv[1]})`;
            const icons = await LabelService.getInstance().getIconsForType(
                objectType, null, this.column.getColumnId(), fv[0]
            );
            const icon = icons && icons.length ? icons[0] : null;

            const node = new TreeNode(fv[0], label, icon, null);

            nodes.push(node);
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING, SortOrder.UP);
        return nodes;
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
