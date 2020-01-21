/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from "../../../../../model/configuration/AutoCompleteConfiguration";
import { TreeNode, TreeHandler, TreeService, TreeUtil } from "../../core/tree";
import { IDynamicFormManager } from "../../core/dynamic-form/IDynamicFormManager";
import { ObjectPropertyValue } from "../../../../../model/ObjectPropertyValue";
import { IdService } from "../../../../../model/IdService";
import { LabelService } from "../../../../../modules/base-components/webapp/core/LabelService";
import { DynamicFormOperationsType } from "../../core/dynamic-form/DynamicFormOperationsType";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { InputFieldTypes } from "../../../../../modules/base-components/webapp/core/InputFieldTypes";
import { KIXModulesService } from "../../../../../modules/base-components/webapp/core/KIXModulesService";
import { DateTimeUtil } from "../../../../../modules/base-components/webapp/core/DateTimeUtil";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";

export class DynamicFormFieldValue {

    public isDropdown: boolean = false;
    public isDate: boolean = false;
    public isDateTime: boolean = false;
    public isTextarea: boolean = false;
    public isSpecificInput: boolean = false;
    public specificInputType: string = null;
    public inputOptions: Array<[string, string | number]> = [];

    public operationIsStringInput: boolean = false;
    public operationIsNone: boolean = false;

    public propertiesPlaceholder: string = '';
    public operationsPlaceholder: string = '';

    public isMultiselect: boolean = false;
    public isAutocomplete: boolean = false;

    public isBetween: boolean = false;

    public label: string = '';

    public autoCompleteConfiguration: AutoCompleteConfiguration;
    public autoCompleteCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    private propertyTreeHandler: TreeHandler;
    private operationTreeHandler: TreeHandler;
    private valueTreeHandler: TreeHandler;

    private date: string;
    private time: string;

    private betweenEndDate: string;
    private betweenEndTime: string;

    public constructor(
        public manager: IDynamicFormManager,
        public value = new ObjectPropertyValue(null, null, null),
        public id: string = IdService.generateDateBasedId('dynamic-value-'),
        public removable: boolean = true,
        public readonly: boolean = value.readonly,
        public changeable: boolean = value.changeable,
        public required: boolean = value.required
    ) {
        this.propertyTreeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler('property-' + this.id, this.propertyTreeHandler);

        this.operationTreeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler('operation-' + this.id, this.operationTreeHandler);

        this.valueTreeHandler = new TreeHandler();
        TreeService.getInstance().registerTreeHandler('value-' + this.id, this.valueTreeHandler);

        this.autoCompleteCallback = this.doAutocompleteSearch.bind(this);
    }

    public async init(): Promise<void> {
        await this.setPropertyTree();
        if (this.value.property) {
            const operator = this.value.operator;
            await this.setProperty(this.value.property);

            const objectType = this.value.objectType ? this.value.objectType : this.manager.objectType;
            this.label = await LabelService.getInstance().getPropertyText(this.value.property, objectType);

            const properties = await this.manager.getProperties();
            const property = properties.find((p) => p[0] === this.value.property);
            if (property) {
                this.propertyTreeHandler.setSelection([new TreeNode(property[0], property[1])], true, true);
            }

            if (operator) {
                await this.setOperator(operator);
                const operationNode = TreeUtil.findNode(this.operationTreeHandler.getTree(), operator);
                if (operationNode) {
                    this.operationTreeHandler.setSelection([operationNode], true);
                }
            }

            await this.setCurrentValue();
        }

        const propertiesPlaceholder = await this.manager.getPropertiesPlaceholder();
        if (propertiesPlaceholder) {
            this.propertiesPlaceholder = await TranslationService.translate(propertiesPlaceholder);
        }
        const operationsPlaceholder = await this.manager.getOperationsPlaceholder();
        if (operationsPlaceholder) {
            this.operationsPlaceholder = await TranslationService.translate(operationsPlaceholder);
        }
    }

    public updateProperties(): void {
        this.setPropertyTree();
    }

    public clearValue(): void {
        this.value.value = null;
        this.valueTreeHandler.setSelection(this.valueTreeHandler.getSelectedNodes(), false, false, true);
    }

    public async setProperty(property: string, update: boolean = false): Promise<void> {
        this.value.property = property;

        if (update) {
            this.value.objectType = null;
            this.value.operator = null;
            this.operationTreeHandler.setSelection(this.operationTreeHandler.getSelectedNodes(), false, true, true);
            this.operationTreeHandler.setTree([]);
            this.value.value = null;
            this.valueTreeHandler.setSelection(this.valueTreeHandler.getSelectedNodes(), false, true, true);
            this.valueTreeHandler.setTree([]);
        }

        await this.manager.setValue(this.value);

        await this.setPropertyTree();
        await this.setOperationTree();
        await this.createValueInput();
    }

    public async setPropertyTree(): Promise<void> {
        const properties = await this.manager.getProperties();
        // FIXME: Its not needed to check unique here, because getProperties() should return only available properties.
        // The manager should make the decision
        const unique = this.manager.uniqueProperties;
        const nodes: TreeNode[] = [];
        if (properties) {
            for (const p of properties) {
                if (
                    (
                        !unique
                        || !this.manager.hasValueForProperty(p[0])
                        || (this.value.property && p[0] === this.value.property)
                    )
                    && !await this.manager.isHiddenProperty(p[0])
                ) {
                    // FIXME: the manager should return TreeNode[], e.g. to handle specific labels and icons
                    nodes.push(new TreeNode(p[0], p[1]));
                }
            }
        }
        this.propertyTreeHandler.setTree(nodes);
        if (this.value.property) {
            const propNode = nodes.find((n) => n.id.toString() === this.value.property);
            if (propNode) {
                this.propertyTreeHandler.setSelection([propNode], true, true, true);
            }
        }
    }

    private async setOperationTree(): Promise<void> {
        const operationsType = await this.manager.getOpertationsType(this.value.property);
        switch (operationsType) {
            case DynamicFormOperationsType.STRING:
                this.operationIsStringInput = true;
                break;
            case DynamicFormOperationsType.NONE:
                this.operationIsNone = true;
                break;
            default:
                if (this.value.property) {
                    const operations = await this.manager.getOperations(this.value.property);
                    const operationNodes = [];
                    for (const o of operations) {
                        const label = await this.manager.getOperatorDisplayText(o);
                        operationNodes.push(new TreeNode(o, label));
                    }
                    this.operationTreeHandler.setTree(operationNodes);
                    if (!!operationNodes.length) {
                        this.value.operator = operationNodes[0].id;
                        this.operationTreeHandler.setSelection([operationNodes[0]], true);
                    }
                }
        }
    }

    public async setOperator(operator: string): Promise<void> {
        this.value.operator = operator;
        this.isBetween = this.value.operator === SearchOperator.BETWEEN;
        await this.createValueInput();
    }

    private async createValueInput(): Promise<void> {
        if (this.manager.showValueInput(this.value)) {
            const property = this.value.property ? this.value.property : null;
            const inputType = await this.manager.getInputType(property);
            this.inputOptions = await this.manager.getInputTypeOptions(
                property, this.value.operator ? this.value.operator : null
            );

            this.isDate = inputType === InputFieldTypes.DATE;
            this.isDateTime = inputType === InputFieldTypes.DATE_TIME;

            this.isDropdown = inputType === InputFieldTypes.DROPDOWN || inputType === InputFieldTypes.OBJECT_REFERENCE;
            this.isAutocomplete = inputType === InputFieldTypes.OBJECT_REFERENCE;
            this.isMultiselect = await this.manager.isMultiselect(property);

            this.valueTreeHandler.setMultiSelect(this.isMultiselect);
            if (this.isAutocomplete) {
                this.autoCompleteConfiguration = new AutoCompleteConfiguration();
            } else {
                this.autoCompleteConfiguration = null;
            }

            this.isTextarea = inputType === InputFieldTypes.TEXT_AREA;

            this.isSpecificInput = inputType === 'SPECIFIC';
            if (this.isSpecificInput) {
                const specificInputType = this.manager.getSpecificInput();
                if (specificInputType) {
                    this.specificInputType = KIXModulesService.getComponentTemplate(specificInputType);
                }
            }


            if (this.value.property && this.isDropdown) {
                const valueNodes = await this.manager.getTreeNodes(this.value.property);
                this.valueTreeHandler.setTree(valueNodes);
            }
        }
    }

    public async setCurrentValue(silent: boolean = true): Promise<void> {
        const currentValues: TreeNode[] = [];
        if (this.value.value) {
            if (!this.isDropdown && this.value.objectType) {
                const objects = await KIXObjectService.loadObjects(
                    this.value.objectType, Array.isArray(this.value.value) ? this.value.value : [this.value.value]
                );
                let label;
                let icon;
                if (objects && objects.length) {
                    const labelProvider = LabelService.getInstance().getLabelProviderForType(this.value.objectType);
                    for (const object of objects) {
                        label = await labelProvider.getObjectText(object);
                        icon = labelProvider.getObjectTypeIcon();
                        currentValues.push(new TreeNode(object.ObjectId, label, icon));
                    }
                }
            } else if (this.isDropdown && !this.isAutocomplete) {
                const valueNodes = this.valueTreeHandler.getTree();
                const selectValues = Array.isArray(this.value.value) ? this.value.value : [this.value.value];
                for (const v of selectValues) {
                    const node = TreeUtil.findNode(valueNodes, v);
                    if (node) {
                        currentValues.push(node);
                    }
                }
            } else if (this.isDropdown && this.isAutocomplete) {
                const selectValues = Array.isArray(this.value.value) ? this.value.value : [this.value.value];
                const nodes = await this.manager.getTreeNodes(this.value.property, selectValues);
                this.valueTreeHandler.setSelection(nodes, true, false, true);
            } else if (this.isDate) {
                if (this.isBetween) {
                    const date = new Date(this.value.value[0]);
                    if (!isNaN(date.getTime())) {
                        this.date = DateTimeUtil.getKIXDateString(date);
                    }
                    const endDate = new Date(this.value.value[1]);
                    if (!isNaN(endDate.getTime())) {
                        this.betweenEndDate = DateTimeUtil.getKIXDateString(endDate);
                    }
                } else {
                    const date = new Date(Array.isArray(this.value.value) ? this.value.value[0] : this.value.value);
                    if (!isNaN(date.getTime())) {
                        this.date = DateTimeUtil.getKIXDateString(date);
                    }
                }
            } else if (this.isDateTime) {
                if (this.isBetween) {
                    const date = new Date(this.value.value[0]);
                    if (!isNaN(date.getTime())) {
                        this.date = DateTimeUtil.getKIXDateString(date);
                        this.time = DateTimeUtil.getKIXTimeString(date);
                    }
                    const endDate = new Date(this.value.value[1]);
                    if (!isNaN(endDate.getTime())) {
                        this.betweenEndDate = DateTimeUtil.getKIXDateString(endDate);
                        this.betweenEndTime = DateTimeUtil.getKIXTimeString(endDate);
                    }
                } else {
                    const date = new Date(Array.isArray(this.value.value) ? this.value.value[0] : this.value.value);
                    if (!isNaN(date.getTime())) {
                        this.date = DateTimeUtil.getKIXDateString(date);
                        this.time = DateTimeUtil.getKIXTimeString(date);
                    }
                }
            } else {
                this.value.value = Array.isArray(this.value.value) ? this.value.value[0] : this.value.value;
            }
        }

        this.valueTreeHandler.setSelection(currentValues, true, silent, true);
    }

    public setValue(value: string | string[] | number[]): void {
        this.value.value = value;
    }

    public setDateValue(value: string): void {
        this.date = value;
        if (this.isDateTime) {
            if (!this.time) {
                this.time = '00:00:00';
            }
            if (this.isBetween) {
                if (!this.betweenEndDate) {
                    this.betweenEndDate = this.date;
                }
                if (!this.betweenEndTime) {
                    this.betweenEndTime = this.time;
                }
            }
        } else if (this.isBetween && !this.betweenEndDate) {
            this.betweenEndDate = this.date;
        }
    }

    public setTimeValue(value: string): void {
        this.time = value;
    }

    public setBetweenEndDateValue(value: string): void {
        this.betweenEndDate = value;
    }

    public setBetweenEndTimeValue(value: string): void {
        this.betweenEndTime = value;
    }


    public getValue(): ObjectPropertyValue {
        const currentValue = { ...this.value };
        if (this.isDate) {
            const date = new Date(this.date);
            date.setHours(0, 0, 0, 0);
            currentValue.value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
            if (this.isBetween && currentValue.value) {
                const endDate = new Date(this.betweenEndDate);
                endDate.setHours(0, 0, 0, 0);
                currentValue.value = isNaN(endDate.getTime())
                    ? null
                    : [currentValue.value, DateTimeUtil.getKIXDateTimeString(endDate)];
            }

        }
        if (this.isDateTime) {
            const date = new Date(`${this.date} ${this.time}`);
            currentValue.value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
            if (this.isBetween && currentValue.value) {
                const endDate = new Date(`${this.betweenEndDate} ${this.betweenEndTime}`);
                currentValue.value = isNaN(endDate.getTime())
                    ? null :
                    [currentValue.value, DateTimeUtil.getKIXDateTimeString(endDate)];
            }

        }
        return currentValue;
    }

    public async doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        return this.manager.searchValues(this.value.property, searchValue, limit);
    }

}
