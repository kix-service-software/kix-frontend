/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { AgentSocketClient } from '../../../../user/webapp/core/AgentSocketClient';
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

        this.regExList = dynamicField?.Config?.AppendValuesRegexList?.map(
            (ri) => { return { regEx: ri.Value, errorMessage: ri.ErrorMessage }; }
        ) || [];

        this.treeHandler?.setMultiSelect(this.multiselect);

        this.translatable = Boolean(Number(dynamicField?.Config?.TranslatableValues)) || false;

        if (!this.possibleValues || !this.possibleValues?.length) {
            await this.setPossibleValuesFromDynamicField();
        }
        this.setValueByDefault(dynamicField.Config);

        await super.initFormValue();

        this.value = this.object[this.property];
    }

    private async setFreeText(dfConfig: any): Promise<void> {
        const allowAppendValues = BrowserUtil.isBooleanTrue(dfConfig?.AppendValues);
        if (allowAppendValues) {
            const hasAppendValuesRoles = dfConfig?.AppendValuesRoleIDs?.length > 0;
            if (hasAppendValuesRoles) {
                const roleIds: number[] = dfConfig?.AppendValuesRoleIDs.map((rid) => Number(rid));
                const currentUser = await AgentSocketClient.getInstance().getCurrentUser();
                const userHasRole = currentUser.RoleIDs.some((rid) => roleIds.some((dfRid) => dfRid === rid));
                if (userHasRole) {
                    this.freeText = true;
                    this.setNewInitialState('freeText', this.freeText);
                }
            } else {
                this.freeText = true;
                this.setNewInitialState('freeText', this.freeText);
            }
        }
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
            && typeof defaultValue === 'string'
            && !this.isEmpty
        ) {
            this.value = [];
            if (separator) {
                for (const item of defaultValue.split(separator)) {
                    this.value.push(item);
                }
            } else {
                this.value.push(defaultValue);
            }

        }
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {

        // define select counts here, too (but not exclusive),
        // to init mulitselect correctly (for preset values by placeholders)
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
        this.minSelectCount = Number(dynamicField?.Config?.CountMin) || 0;
        this.maxSelectCount = Number(dynamicField?.Config?.CountMax) || 1;
        await super.initFormValueByField(field);

        this.setFreeText(dynamicField?.Config);
    }

    public async loadSelectableValues(): Promise<void> {
        const dynamicField = await KIXObjectService.loadDynamicField(this.object?.Name);
        const possibleValues = dynamicField?.Config?.PossibleValues;
        if (possibleValues) {
            let nodes: TreeNode[] = [];
            for (const pv in possibleValues) {
                if (possibleValues[pv]) {
                    if (this.isValidValue(pv)) {
                        const node = await this.createNode(pv, possibleValues[pv]);
                        nodes.push(node);
                    }

                    if (Array.isArray(this.forbiddenValues)) {
                        nodes = nodes.filter(
                            (n) => !this.forbiddenValues?.some((fv) => fv?.toString() === n.id?.toString())
                        );
                    }
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
                    if (this.isValidValue(key) || this.freeText) {
                        const value = possibleValues[key] || key;
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
        await this.setPossibleValuesFromDynamicField();

        if (Array.isArray(ignoreFormValueProperties)) {
            ignoreFormValueProperties.push(FormValueProperty.POSSIBLE_VALUES);
        } else {
            ignoreFormValueProperties = [FormValueProperty.POSSIBLE_VALUES];
        }

        await super.reset(ignoreProperties, ignoreFormValueProperties, ignoreFormValueReset);
    }

}