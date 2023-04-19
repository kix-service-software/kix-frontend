/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormValueProperty } from '../../FormValueProperty';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';
import { SelectObjectFormValue } from '../SelectObjectFormValue';

export class DynamicFieldSelectionFormValue extends SelectObjectFormValue<string[]> {

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        protected dfName: string
    ) {
        super(property, object, objectValueMapper, parent);
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValue(): Promise<void> {
        const dynamicField = await KIXObjectService.loadDynamicField(this.object?.Name);

        this.countMin = 1;
        this.countMax = 1;
        this.countDefault = 1;

        this.minSelectCount = Number(dynamicField?.Config?.CountMin) || 0;
        this.maxSelectCount = Number(dynamicField?.Config?.CountMax) || 0;

        if (this.minSelectCount > this.maxSelectCount) {
            this.minSelectCount = this.maxSelectCount;
        }

        this.multiselect = this.maxSelectCount < 0 || this.maxSelectCount > 1;
        this.setNewInitialState('maxSelectCount', this.maxSelectCount);

        this.treeHandler?.setMultiSelect(this.multiselect);

        this.translatable = Boolean(Number(dynamicField?.Config?.TranslatableValues)) || false;

        if (!this.possibleValues || !this.possibleValues?.length) {
            await this.setPossibleValuesFromDynamicField();
        }
        this.setValueByDefault(dynamicField.Config);

        await super.initFormValue();

        this.value = this.object[this.property];
    }

    private setValueByDefault(config: any): void {
        const isDefaultValueDefined = config?.DefaultValue !== ''
            && config?.DefaultValue !== null
            && typeof config?.DefaultValue !== 'undefined';

        const isSeparatorDefined = config?.ItemSeparator !== ''
            && config?.ItemSeparator !== null
            && typeof config?.ItemSeparator !== 'undefined';

        let defaultValue = null;
        if (isDefaultValueDefined) {
            defaultValue = config?.DefaultValue;
        }

        let separator = null;
        if (isSeparatorDefined) {
            separator = config?.ItemSeparator;
        }

        if (
            !this.value
            && defaultValue !== null
            && !this.isEmpty
        ) {
            if (separator) {
                this.value = [];
                for (const item of defaultValue.split(separator)) {
                    this.value.push(item);
                }
            }
            else {
                this.value = defaultValue;
            }
        }
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {

        // define select counts here, too (but not exclusive),
        // to init mulitselect correctly (for preset values by placeholders)
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
        this.minSelectCount = Number(dynamicField?.Config?.CountMin) || 0;
        this.maxSelectCount = Number(dynamicField?.Config?.CountMax) || 1;
        super.initFormValueByField(field);
    }

    public async loadSelectableValues(): Promise<void> {
        const dynamicField = await KIXObjectService.loadDynamicField(this.object?.Name);
        const possibleValues = dynamicField?.Config?.PossibleValues;
        if (possibleValues) {
            const nodes: TreeNode[] = [];
            for (const pv in possibleValues) {
                if (possibleValues[pv] && this.possibleValues?.some((v) => v.toString() === pv.toString())) {
                    const node = await this.createNode(pv, possibleValues[pv]);
                    nodes.push(node);
                }
            }

            this.treeHandler?.setTree(nodes, null, true, true);
        }
    }

    public async loadSelectedValues(): Promise<void> {
        const selectedNodes: TreeNode[] = [];
        if (this.value && !Array.isArray(this.value)) {
            this.value = [this.value];
        }
        if (this.value?.length) {
            const dynamicField = await KIXObjectService.loadDynamicField(this.object?.Name);
            const possibleValues = dynamicField?.Config?.PossibleValues;
            if (possibleValues) {
                for (const key of this.value) {
                    const value = possibleValues[key];
                    if (value && this.possibleValues?.some((v) => v.toString() === key.toString())) {
                        const node = await this.createNode(key, value);
                        selectedNodes.push(node);
                    }
                }
            }
        }

        this.treeHandler?.setSelection(selectedNodes, true, true, true, true);

        this.selectedNodes = selectedNodes;
    }

    private async createNode(key: string, value: string): Promise<TreeNode> {
        if (this.translatable) {
            value = await TranslationService.translate(value);
        }
        return new TreeNode(key, value);
    }

    private async setPossibleValuesFromDynamicField(): Promise<void> {
        const dynamicField = await KIXObjectService.loadDynamicField(this.object?.Name);
        if (dynamicField?.Config?.PossibleValues) {
            this.possibleValues = Object.keys(dynamicField.Config.PossibleValues);
        } else {
            this.possibleValues = [];
        }
    }

    public async reset(
        ignoreProperties: string[] = [], ignoreFormValueProperties: string[] = [], ignoreFormValueReset: string[] = []
    ): Promise<void> {
        await super.reset(ignoreProperties, ignoreFormValueProperties, ignoreFormValueReset);
        await this.setPossibleValuesFromDynamicField();
    }

}