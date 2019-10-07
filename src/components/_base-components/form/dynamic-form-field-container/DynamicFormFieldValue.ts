/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IdService, LabelService, KIXObjectService, ObjectPropertyValue, IDynamicFormManager, DynamicFormOperationsType
} from '../../../../core/browser';
import {
    TreeNode, InputFieldTypes, DateTimeUtil, TreeUtil, TreeService, TreeHandler, AutoCompleteConfiguration
} from '../../../../core/model';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { KIXModulesService } from '../../../../core/browser/modules';

export class DynamicFieldValue {

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

    public label: string = '';

    public autoCompleteConfiguration: AutoCompleteConfiguration;
    public autoCompleteCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    private propertyTreeHandler: TreeHandler;
    private operationTreeHandler: TreeHandler;
    private valueTreeHandler: TreeHandler;

    private date: string;
    private time: string;

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
        await this.createPropertyNodes();
        if (this.value.property) {
            await this.setProperty(this.value.property, true);

            const objectType = this.value.objectType ? this.value.objectType : this.manager.objectType;
            this.label = await LabelService.getInstance().getPropertyText(this.value.property, objectType);

            const properties = await this.manager.getProperties();
            const property = properties.find((p) => p[0] === this.value.property);
            if (property) {
                this.propertyTreeHandler.setSelection([new TreeNode(property[0], property[1])], true, true);
            }

            if (this.value.operator) {
                const operationNode = TreeUtil.findNode(this.operationTreeHandler.getTree(), this.value.operator);
                if (operationNode) {
                    this.operationTreeHandler.setSelection([operationNode], true);
                    await this.createValueInput();
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
        this.createPropertyNodes();
    }

    public clearValue(): void {
        this.value.value = null;
        this.valueTreeHandler.setSelection(this.valueTreeHandler.getSelectedNodes(), false);
    }

    public async setProperty(property: string, update: boolean = false): Promise<void> {
        this.value.property = property;

        if (!update) {
            this.value.objectType = null;
            this.value.value = null;
            this.valueTreeHandler.setSelection(this.valueTreeHandler.getSelectedNodes(), false);
            this.valueTreeHandler.setTree([]);
        }

        await this.manager.setValue(this.value);

        await this.createPropertyNodes();
        await this.createOperationNodes();
        await this.createValueInput();
    }

    public async createPropertyNodes(): Promise<void> {
        const properties = await this.manager.getProperties();
        // FIXME: Its not needed to check unique here, because getProperties() should return only available properties.
        // The manager should make the decision
        const unique = this.manager.uniqueProperties;
        if (properties) {
            const nodes = [];
            for (const p of properties) {
                if (!unique || !this.manager.hasValueForProperty(p[0])) {
                    // FIXME: the manager should return TreeNode[], e.g. to handle specific labels and icons
                    nodes.push(new TreeNode(p[0], p[1]));
                }
            }
            this.propertyTreeHandler.setTree(nodes);
        }
    }

    private async createOperationNodes(): Promise<void> {
        if (this.value.property) {
            const operations = await this.manager.getOperations(this.value.property);
            const operationNodes = [];
            for (const o of operations) {
                const label = await this.manager.getOperatorDisplayText(o);
                operationNodes.push(new TreeNode(o, label));
            }
            this.operationTreeHandler.setTree(operationNodes);
            if (operationNodes.length > 0 && !this.value.operator) {
                this.setOperator(operationNodes[0].id);
                this.operationTreeHandler.setSelection([operationNodes[0]], true);
            }
        }

        const operationsType = await this.manager.getOpertationsType(this.value.property);
        switch (operationsType) {
            case DynamicFormOperationsType.STRING:
                this.operationIsStringInput = true;
                break;
            case DynamicFormOperationsType.NONE:
                this.operationIsNone = true;
                break;
            default:
        }
    }

    public async setOperator(operator: string): Promise<void> {
        this.value.operator = operator;
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
            this.isMultiselect = this.manager.isMultiselect(property);

            this.valueTreeHandler = new TreeHandler([], null, null, this.isMultiselect);
            TreeService.getInstance().registerTreeHandler('value-' + this.id, this.valueTreeHandler);
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

    public async setCurrentValue(): Promise<void> {
        const currentValues: TreeNode[] = [];
        if (!this.isDropdown && this.value.objectType && this.value.value) {
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
        } else if (this.isDropdown) {
            const valueNodes = this.valueTreeHandler.getTree();
            if (Array.isArray(this.value.value)) {
                for (const v of this.value.value) {
                    const node = TreeUtil.findNode(valueNodes, v);
                    if (node) {
                        currentValues.push(node);
                    }
                }
            }
        }
        this.valueTreeHandler.setSelection(currentValues, true);
    }

    public setValue(value: string | string[] | number[]): void {
        this.value.value = value;
    }

    public setDateValue(value: string): void {
        this.date = value;
    }

    public setTimeValue(value: string): void {
        this.time = value;
    }

    public getValue(): ObjectPropertyValue {
        const currentValue = { ...this.value };
        if (this.isDate) {
            const date = new Date(currentValue.value);
            currentValue.value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
        }
        if (this.isDateTime) {
            const date = new Date(`${this.date} ${this.time}`);
            currentValue.value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
        }
        return currentValue;
    }

    public async doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        return this.manager.searchValues(this.value.property, searchValue, limit);
    }

}
