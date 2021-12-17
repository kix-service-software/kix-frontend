/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { TreeNode, TreeHandler, TreeService, TreeUtil } from '../../core/tree';
import { IDynamicFormManager } from '../../core/dynamic-form/IDynamicFormManager';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { IdService } from '../../../../../model/IdService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { DynamicFormOperationsType } from '../../core/dynamic-form/DynamicFormOperationsType';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { SearchDefinition } from '../../../../search/webapp/core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { BrowserUtil } from '../../core/BrowserUtil';


export class DynamicFormFieldValue {

    public instanceId: string = IdService.generateDateBasedId('DynamicFormFieldValue');

    public isDropdown: boolean = false;
    public isDate: boolean = false;
    public isDateTime: boolean = false;
    public isTextarea: boolean = false;
    public isCheckbox: boolean = false;
    public isRelativeTime: boolean = false;
    public isSpecificInput: boolean = false;
    public isNumber: boolean = false;
    public specificInputType: string = null;
    public inputOptions: Array<[string, string | number]> = [];

    public operationIsStringInput: boolean = false;
    public operationIsNone: boolean = false;

    public propertiesPlaceholder: string = '';
    public operationsPlaceholder: string = '';

    public isMultiselect: boolean = false;
    public isAutocomplete: boolean = false;
    public isFreeText: boolean = false;

    public isBetween: boolean = false;

    public label: string = '';

    public autoCompleteConfiguration: AutoCompleteConfiguration;
    public autoCompleteCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    private propertyTreeHandler: TreeHandler;
    private operationTreeHandler: TreeHandler;
    private valueTreeHandler: TreeHandler;
    private relativeTimeUnitTreeHandler: TreeHandler;

    private date: string;
    private time: string;

    private betweenEndDate: string;
    private betweenEndTime: string;

    private relativeTimeValue: string;
    private relativeTimeUnit: string;

    private numberValue: string;
    private betweenEndNumberValue: string;

    public constructor(
        public manager: IDynamicFormManager,
        public value = new ObjectPropertyValue(null, null, null),
        public id?: string,
        public removable: boolean = true,
        public readonly: boolean = value.readonly,
        public changeable: boolean = value.changeable,
        public required: boolean = value.required
    ) {

        if (!id) {
            this.id = this.value.id;
        }
        this.propertyTreeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler('property-' + this.id, this.propertyTreeHandler);

        this.operationTreeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler('operation-' + this.id, this.operationTreeHandler);

        this.valueTreeHandler = new TreeHandler();
        TreeService.getInstance().registerTreeHandler('value-' + this.id, this.valueTreeHandler);

        this.relativeTimeUnitTreeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler('relativeTimeUnit-' + this.id, this.relativeTimeUnitTreeHandler);

        this.autoCompleteCallback = this.doAutocompleteSearch.bind(this);
    }

    public async init(): Promise<void> {
        await this.setProperty(this.value.property, false, true);
        await this.setOperator(this.value.operator);
        await this.setCurrentValue(undefined, true);
    }

    public updateProperties(): void {
        this.setPropertyTree();
    }

    public clearValue(): void {
        this.value.value = null;
        if (this.isDropdown) {
            this.valueTreeHandler.setSelection(this.valueTreeHandler.getSelectedNodes(), false, false, true);
        }
    }

    public async setProperty(property: string, update: boolean = false, silent?: boolean): Promise<void> {
        this.value.property = property;

        if (update) {
            this.value.objectType = null;

            if (this.manager.resetOperator) {
                this.value.operator = null;
                this.operationTreeHandler.setSelection(this.operationTreeHandler.getSelectedNodes(), false, true, true);
                this.operationTreeHandler.setTree([]);
            }

            this.value.value = null;
            if (this.isDropdown) {
                this.valueTreeHandler.setSelection(this.valueTreeHandler.getSelectedNodes(), false, true, true);
                this.valueTreeHandler.setTree([]);
            }

            this.value.additionalOptions = await this.manager.getAdditionalOptions(property);
        }

        // get label (needed if field is required)
        if (this.required) {
            const objectType = this.value.objectType ? this.value.objectType : this.manager.objectType;
            this.label = await LabelService.getInstance().getPropertyText(this.value.property, objectType);
        }

        await this.manager.setValue(this.value, silent);

        await this.setPropertyTree();
        await this.setOperationTree();
        await this.createValueInput();
        await this.setRelativeTimeUnitTree();
    }

    public async setPropertyTree(): Promise<void> {
        const properties = await this.manager.getProperties();
        // TODO: Its not needed to check unique here, because getProperties() should return only available properties.
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
                    // TODO: the manager should return TreeNode[], e.g. to handle specific labels and icons
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
                    if (operationNodes.length) {
                        let operationNode = operationNodes[0];
                        if (this.value.operator) {
                            operationNode = operationNodes.find((n) => n.id === this.value.operator);
                        } else {
                            this.value.operator = operationNode.id;
                        }
                        this.operationTreeHandler.setSelection([operationNode], true);
                    }
                }
        }
    }

    private async setRelativeTimeUnitTree(): Promise<void> {
        const translations = await TranslationService.createTranslationObject([
            'Translatable#Year(s)',
            'Translatable#Month(s)',
            'Translatable#Week(s)',
            'Translatable#Day(s)',
            'Translatable#Hour(s)',
            'Translatable#Minutes(s)',
            'Translatable#Seconds(s)'
        ]);

        const timeUnitNodes = [
            new TreeNode('Y', translations['Translatable#Year(s)']),
            new TreeNode('M', translations['Translatable#Month(s)']),
            new TreeNode('w', translations['Translatable#Week(s)']),
            new TreeNode('d', translations['Translatable#Day(s)']),
            new TreeNode('h', translations['Translatable#Hour(s)']),
            new TreeNode('m', translations['Translatable#Minutes(s)']),
            new TreeNode('s', translations['Translatable#Seconds(s)']),
        ];
        this.relativeTimeUnitTreeHandler.setTree(timeUnitNodes);
        const selectedNode = timeUnitNodes.find((n) => n.id === 'm');
        this.relativeTimeUnitTreeHandler.setSelection([selectedNode], true);
        this.relativeTimeUnit = 'm';
    }

    public async setOperator(operator: string): Promise<void> {
        const relativeDateTimeOperators = SearchDefinition.getRelativeDateTimeOperators();

        this.value.operator = operator;
        this.isBetween = this.value.operator === SearchOperator.BETWEEN;
        this.isRelativeTime = relativeDateTimeOperators.includes(operator as SearchOperator);
        if (this.manager.resetValue) {
            await this.createValueInput();
        }
    }

    private async createValueInput(): Promise<void> {
        if (this.manager.showValueInput(this.value)) {
            const property = this.value.property ? this.value.property : null;
            const inputType = await this.manager.getInputType(property, this.value.operator as SearchOperator);
            this.inputOptions = await this.manager.getInputTypeOptions(
                property, this.value.operator ? this.value.operator : null
            );

            this.isDate = inputType === InputFieldTypes.DATE;
            this.isDateTime = inputType === InputFieldTypes.DATE_TIME;
            this.isNumber = inputType === InputFieldTypes.NUMBER;

            this.isDropdown = inputType === InputFieldTypes.DROPDOWN || inputType === InputFieldTypes.OBJECT_REFERENCE;
            this.isAutocomplete = inputType === InputFieldTypes.OBJECT_REFERENCE;
            this.isMultiselect = await this.manager.isMultiselect(property, this.value.operator);
            this.isFreeText = this.inputOptions
                ? this.inputOptions.some((o) => o[0] === ObjectReferenceOptions.FREETEXT && Boolean(o[1]))
                : false;

            this.valueTreeHandler.setMultiSelect(this.isMultiselect);
            if (this.isAutocomplete) {
                this.autoCompleteConfiguration = new AutoCompleteConfiguration();
            } else {
                this.autoCompleteConfiguration = null;
            }

            this.isTextarea = inputType === InputFieldTypes.TEXT_AREA;
            this.isCheckbox = inputType === InputFieldTypes.CHECKBOX;

            this.isSpecificInput = inputType === 'SPECIFIC';
            if (this.isSpecificInput) {
                const specificInputType = this.manager.getSpecificInput(property);
                if (specificInputType) {
                    this.specificInputType = KIXModulesService.getComponentTemplate(specificInputType);
                }
            }

            if (this.value.property && this.isDropdown && !this.isAutocomplete) {
                const valueNodes = await this.manager.getTreeNodes(this.value.property);
                this.valueTreeHandler.setTree(valueNodes);
            }

            const preloadOption = this.inputOptions.find(
                (o) => o[0] === ObjectReferenceOptions.AUTOCOMPLETE_PRELOAD_PATTERN
            );
            if (this.isAutocomplete && preloadOption && preloadOption[1]) {
                const tree = await this.doAutocompleteSearch(10, preloadOption[1].toString());
                this.valueTreeHandler.setTree(tree);
            }
        }
    }

    public async setCurrentValue(silent: boolean = true, init?: boolean): Promise<void> {
        let currentValues: TreeNode[] = [];
        if (this.value.value) {
            if (this.isDropdown && !this.isAutocomplete) {
                const valueNodes = this.valueTreeHandler.getTree();
                const selectValues = Array.isArray(this.value.value) ? this.value.value : [this.value.value];
                for (const v of selectValues) {
                    const node = TreeUtil.findNode(valueNodes, v);
                    if (node) {
                        currentValues.push(node);
                    } else if (this.isFreeText) {
                        currentValues.push(new TreeNode(v, v));
                    }
                }
            } else if (this.isDropdown && this.isAutocomplete) {
                const selectValues = Array.isArray(this.value.value) ? this.value.value : [this.value.value];
                currentValues = await this.manager.getTreeNodes(
                    // filter placeholder values
                    this.value.property, selectValues.filter((v) => typeof v !== 'string' || !v.match(/<KIX_.+>/))
                );
                this.valueTreeHandler.setTree(currentValues);
                if (this.isFreeText) {
                    this.valueTreeHandler.setSelection(
                        selectValues
                            .filter((sv) => !currentValues.some((cv) => cv.id.toString() === sv.toString()))
                            .map((v) => new TreeNode(v, v)), true, true, true, false
                    );
                }
            } else if (this.isDate) {
                if (this.isBetween) {
                    const date = new Date(this.value.value[0]);
                    if (!isNaN(date.getTime())) {
                        this.date = DateTimeUtil.getKIXDateString(date);
                        if (init) {
                            this.startDateSet = true;
                        }
                    }
                    const endDate = new Date(this.value.value[1]);
                    if (!isNaN(endDate.getTime())) {
                        this.betweenEndDate = DateTimeUtil.getKIXDateString(endDate);
                        if (init) {
                            this.endDateSet = true;
                        }
                    }
                } else {
                    const date = new Date(Array.isArray(this.value.value) ? this.value.value[0] : this.value.value);
                    if (!isNaN(date.getTime())) {
                        this.date = DateTimeUtil.getKIXDateString(date);
                        if (init) {
                            this.startDateSet = true;
                        }
                    }
                }
            } else if (this.isDateTime) {
                if (this.isBetween) {
                    const date = new Date(this.value.value[0]);
                    if (!isNaN(date.getTime())) {
                        this.date = DateTimeUtil.getKIXDateString(date);
                        this.time = DateTimeUtil.getKIXTimeString(date);
                        if (init) {
                            this.startDateSet = true;
                            this.startTimeSet = true;
                        }
                    }
                    const endDate = new Date(this.value.value[1]);
                    if (!isNaN(endDate.getTime())) {
                        this.betweenEndDate = DateTimeUtil.getKIXDateString(endDate);
                        this.betweenEndTime = DateTimeUtil.getKIXTimeString(endDate);
                        if (init) {
                            this.endDateSet = true;
                            this.endTimeSet = true;
                        }
                    }
                } else {
                    const date = new Date(Array.isArray(this.value.value) ? this.value.value[0] : this.value.value);
                    if (!isNaN(date.getTime())) {
                        this.date = DateTimeUtil.getKIXDateString(date);
                        this.time = DateTimeUtil.getKIXTimeString(date);
                        if (init) {
                            this.startTimeSet = true;
                            this.startDateSet = true;
                        }
                    }
                }
            } else if (!this.isDropdown && this.value.objectType) {
                const objects = await KIXObjectService.loadObjects(
                    this.value.objectType, Array.isArray(this.value.value) ? this.value.value : [this.value.value]
                );
                let label;
                let icon;
                if (objects && objects.length) {
                    for (const object of objects) {
                        label = await LabelService.getInstance().getObjectText(object);
                        icon = LabelService.getInstance().getObjectTypeIcon(object.KIXObjectType);
                        currentValues.push(new TreeNode(object.ObjectId, label, icon));
                    }
                }
            } else if (this.isNumber) {
                if (this.isBetween && Array.isArray(this.value.value)) {
                    this.numberValue = !isNaN(this.value.value[0]) ? this.value.value[0] : null;
                    this.betweenEndNumberValue = !isNaN(this.value.value[1]) ? this.value.value[1] : null;
                } else {
                    this.numberValue = !isNaN(this.value.value) ? this.value.value : null;
                }
            } else if (this.isRelativeTime && Array.isArray(this.value.value)) {
                this.relativeTimeValue = this.value.value[0];
                this.relativeTimeUnit = this.value.value[1];
                const node = TreeUtil.findNode(this.relativeTimeUnitTreeHandler.getTree(), this.relativeTimeUnit);
                currentValues.push(node);
            } else if (!this.isSpecificInput) {
                this.value.value = Array.isArray(this.value.value) ? this.value.value[0] : this.value.value;
            }
        }

        if (this.isDropdown) {
            this.valueTreeHandler.setSelection(currentValues, true, silent, true);
        }
        if (this.isRelativeTime) {
            this.relativeTimeUnitTreeHandler.setSelection(currentValues, true, silent, true);
        }
    }

    public setValue(value: string | string[] | number[]): void {
        this.value.value = value;
    }

    private endDateSet: boolean = false;
    private startDateSet: boolean = false;
    public setDateValue(value: string): void {
        this.date = value;
        this.startDateSet = true;

        // set end date if no value already set or value was not initial value and not set by user
        if (this.date && this.isBetween && (!this.betweenEndDate || !this.endDateSet)) {
            const asDate = new Date(this.date);
            if (typeof asDate.getTime === 'function') {
                this.betweenEndDate = DateTimeUtil.getKIXDateString(new Date(asDate.getTime() + 1000 * 60 * 60 * 24));
            } else {
                this.betweenEndDate = this.date;
            }
            this.endDateSet = false;
        }

        if (this.isDateTime) {
            if (!this.time) {
                this.time = '00:00:00';
            }
            if (this.isBetween && !this.betweenEndTime) {
                this.betweenEndTime = this.time;
            }
        }
    }

    private endTimeSet: boolean = false;
    private startTimeSet: boolean = false;
    public setTimeValue(value: string): void {
        this.time = value;
        this.startTimeSet = true;

        if (this.time && ((this.isBetween && !this.betweenEndTime) || !this.endTimeSet)) {
            this.betweenEndTime = this.time;
            this.endTimeSet = false;
        }
    }

    public setBetweenEndDateValue(value: string): void {
        this.betweenEndDate = value;
        this.endDateSet = true;

        // set start date if no value already set or value was not initial value and not set by user
        if (this.betweenEndDate && (!this.date || !this.startDateSet)) {
            const endAsDate = new Date(this.betweenEndDate);
            if (typeof endAsDate.getTime === 'function') {
                this.date = DateTimeUtil.getKIXDateString(new Date(endAsDate.getTime() - 1000 * 60 * 60 * 24));
            } else {
                this.date = this.betweenEndDate;
            }
            this.startDateSet = false;
        }
    }

    public setBetweenEndTimeValue(value: string): void {
        this.betweenEndTime = value;
        this.endTimeSet = true;

        if (this.betweenEndTime && (!this.time || !this.startTimeSet)) {
            this.time = this.betweenEndTime;
            this.startTimeSet = false;
        }
    }

    public setRelativeTimeUnitValue(value: string): void {
        this.relativeTimeUnit = value;
    }

    public setRelativeTimeValue(value: string): void {
        this.relativeTimeValue = value;
    }

    public setNumberValue(value: string): void {
        this.numberValue = value;
    }

    public setBetweenEndNumberValue(value: string): void {
        this.betweenEndNumberValue = value;
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
        if (this.isNumber) {
            currentValue.value = !isNaN(Number(this.numberValue)) && this.numberValue !== ''
                ? Number(this.numberValue) : null;
            if (this.isBetween && currentValue.value) {
                currentValue.value = !isNaN(Number(this.betweenEndNumberValue)) && this.betweenEndNumberValue !== ''
                    ? [currentValue.value, Number(this.betweenEndNumberValue)] : null;
            }
        }
        if (this.isRelativeTime) {
            currentValue.value = [this.relativeTimeValue, this.relativeTimeUnit];
        }
        return currentValue;
    }

    public async doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        let tree: TreeNode[];
        let loadingOptions: KIXObjectLoadingOptions;
        const option = this.inputOptions.find((o) => o[0] === ObjectReferenceOptions.LOADINGOPTIONS);
        if (option) {
            loadingOptions = { ...option[1] as KIXObjectLoadingOptions };
            loadingOptions.filter = loadingOptions.filter ? [...loadingOptions.filter] : [];
        } else {
            loadingOptions = new KIXObjectLoadingOptions();
        }

        loadingOptions.limit = limit;

        if (this.manager.useOwnSearch) {
            tree = await this.manager.searchObjectTree(this.value.property, searchValue, loadingOptions);
        } else {
            tree = await KIXObjectService.searchObjectTree(
                this.manager.objectType, this.value.property, searchValue, loadingOptions
            );
        }

        return tree;
    }

    public toggleOption(option: any): void {
        const index = this.value.options.findIndex((o) => o.option === option.option);
        if (index !== -1) {
            this.value.options.splice(index, 1);
        } else {
            this.value.options.push(option);
        }
    }

    public isOptionSet(option: any): boolean {
        return this.value.options.some((o) => o.option === option.option);
    }

}
