/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TreeHandler, TreeService, TreeNode } from '../../../../base-components/webapp/core/tree';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { DynamicFieldProperty } from '../../../../dynamic-fields/model/DynamicFieldProperty';
import { DynamicField } from '../../../../dynamic-fields/model/DynamicField';
import { FilterType } from '../../../../../model/FilterType';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends FormInputComponent<[string, string], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    private async update(): Promise<void> {
        this.state.dfNameLabel = await TranslationService.translate('Translatable#Name');
        this.state.dfValueLabel = await TranslationService.translate('Translatable#Value');
    }

    public async onMount(): Promise<void> {
        const treeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        await this.load();
        await super.onMount();
        this.state.prepared = true;
    }

    private async load(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                DynamicFieldProperty.OBJECT_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, KIXObjectType.TICKET
            )
        ]);
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions, null, true
        ).catch(() => [] as DynamicField[]);

        let nodes: TreeNode[];
        if (dynamicFields) {
            const names = await TranslationService.createTranslationObject(dynamicFields.map((df) => df.Label));
            nodes = dynamicFields.map((df) => new TreeNode(df.Name, names[df.Label]));
        }

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes, null, true);
        }
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        if (value && Array.isArray(value.value)) {
            if (value.value[0]) {
                const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
                if (treeHandler) {
                    const nodes = treeHandler.getTree();
                    const node = nodes.find((eventNode) => eventNode.id === value.value[0]);
                    if (node) {
                        this.state.currentDFName = value.value[0];
                        node.selected = true;
                        treeHandler.setSelection([node], true, true, true);
                    }
                }
            }
            this.state.currentDfValue = value.value[1];
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.state.currentDFName = nodes && nodes[0] ? nodes[0].id : null;
        (this as any).emit('valueChanged', [this.state.currentDFName, this.state.currentDfValue]);
        super.provideValue([this.state.currentDFName, this.state.currentDfValue]);
    }

    public valueChanged(event: any): void {
        if (event) {
            this.state.currentDfValue = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit('valueChanged', [this.state.currentDFName, this.state.currentDfValue]);
            super.provideValue([this.state.currentDFName, this.state.currentDfValue]);
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
