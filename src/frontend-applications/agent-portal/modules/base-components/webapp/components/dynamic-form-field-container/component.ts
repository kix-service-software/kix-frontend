/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IDynamicFormManager } from '../../core/dynamic-form/IDynamicFormManager';
import { DynamicFormFieldValue } from './DynamicFormFieldValue';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { TreeNode } from '../../core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ObjectPropertyValueOption } from '../../../../../model/ObjectPropertyValueOption';

class Component {

    private state: ComponentState;
    private manager: IDynamicFormManager;
    private provideTimeout: any;
    private addEmptyValueTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.manager = input.manager;
    }

    public reset(): void {
        this.onMount();
    }

    public async updateValues(): Promise<void> {
        const currentValues = this.manager.getValues();

        this.state.dynamicValues = this.state.dynamicValues.filter(
            (dv) => !currentValues.some((cv) => cv.id === dv.id)
        );

        for (const cv of currentValues) {
            const existingValue = this.state.dynamicValues.find((bv) => bv.value.id === cv.id);
            if (existingValue) {
                if (existingValue.value.operator !== cv.operator) {
                    await existingValue.setOperator(cv.operator);
                }
                if (existingValue.value.value !== cv.value) {
                    existingValue.setValue(cv.value);
                    existingValue.setCurrentValue(true);
                }
                existingValue.required = cv.required;
            } else {
                const value = new DynamicFormFieldValue(this.manager, cv);
                await value.init();
                this.state.dynamicValues.push(value);
            }
        }

        this.addEmptyValue();

        if (this.manager.uniqueProperties) {
            this.state.dynamicValues.forEach((dv) => dv.updateProperties());
        }

        (this as any).setStateDirty('dynamicValues');
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Remove parameter'
        ]);
        if (this.manager) {
            this.manager.init();

            const initPromises = [];
            const values = [];
            for (const v of this.manager.getValues()) {
                const formFieldValue = new DynamicFormFieldValue(
                    this.manager,
                    new ObjectPropertyValue(
                        v.property, v.operator, v.value, v.options, v.required, v.valid,
                        v.objectType, v.readonly, v.changeable, v.id, v.additionalOptions
                    )
                );
                initPromises.push(formFieldValue.init());
                values.push(formFieldValue);
            }
            await Promise.all(initPromises);
            this.state.dynamicValues = values;

            this.state.options = await this.manager.getFieldOptions();

            this.state.hasAdditionalOptions = this.manager.hasAdditionalOptions();

            this.addEmptyValue();
        }
    }

    public async propertyChanged(value: DynamicFormFieldValue, nodes: TreeNode[]): Promise<void> {
        await value.setProperty(nodes && nodes.length ? nodes[0].id : null, true);
        if (await this.manager.clearValueOnPropertyChange(value.getValue().property)) {
            value.clearValue();
        }

        this.provideValue(value);
    }

    public async operationChanged(value: DynamicFormFieldValue, nodes: TreeNode[]): Promise<void> {
        await value.setOperator(nodes && nodes.length ? nodes[0].id : null);
        this.provideValue(value);
    }

    public operationStringChanged(value: DynamicFormFieldValue, event: any): void {
        const operationString = event.target.value;
        value.setOperator(operationString);
        this.provideValue(value);
    }

    public treeValueChanged(value: DynamicFormFieldValue, nodes: TreeNode[]): void {
        value.setValue(nodes.map((n) => n.id));
        this.provideValue(value);
    }

    public additionalOptionsChanged(value: DynamicFormFieldValue, event: any): void {
        const additionalOptions = event.target.value;
        value.value.additionalOptions = additionalOptions;
        this.provideValue(value);
    }

    public setValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setValue(newValue);
        this.provideValue(value);
    }

    public setNumberValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setNumberValue(newValue);
        this.provideValue(value);
    }

    public setNumberEndValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setBetweenEndNumberValue(newValue);
        this.provideValue(value);
    }

    public setDateValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setDateValue(newValue);
        this.provideValue(value);
    }

    public setTimeValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setTimeValue(newValue);
        this.provideValue(value);
    }

    public setBetweenEndDateValue(value: DynamicFormFieldValue, event: any): void {
        const date = event.target.value;
        value.setBetweenEndDateValue(date);
        this.provideValue(value);
    }

    public setBetweenEndTimeValue(value: DynamicFormFieldValue, event: any): void {
        const time = event.target.value;
        value.setBetweenEndTimeValue(time);
        this.provideValue(value);
    }

    public setCheckboxValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setValue(newValue);
        this.provideValue(value);
    }

    public setSpecificValue(value: DynamicFormFieldValue, emittedValue: any): void {
        value.setValue(emittedValue);
        this.provideValue(value);
    }

    public optionClicked(option: ObjectPropertyValueOption, value: DynamicFormFieldValue): void {
        value.toggleOption(option);
        this.provideValue(value);
    }

    public async provideValue(value: DynamicFormFieldValue): Promise<void> {
        await this.manager.setValue(value.getValue());
        if (!this.provideTimeout) {
            this.provideTimeout = setTimeout(async () => {
                this.provideTimeout = null;
                await this.updateValues();
            }, 50);
        }
    }

    public async removeValue(value: DynamicFormFieldValue): Promise<void> {
        this.state.dynamicValues = this.state.dynamicValues.filter((dv) => dv.instanceId !== value.instanceId);
        await this.manager.removeValue(value.getValue());
        await this.updateValues();
    }

    private addEmptyValue(): void {
        if (this.addEmptyValueTimeout) {
            window.clearTimeout(this.addEmptyValueTimeout);
        }

        this.addEmptyValueTimeout = setTimeout(async () => {
            const canAddEmptyValue = await this.manager.shouldAddEmptyField();
            const hasEmptyValue = this.state.dynamicValues.some((sv) => sv.getValue().property === null);

            if (canAddEmptyValue && !hasEmptyValue) {
                const emptyField = new DynamicFormFieldValue(this.manager);
                await emptyField.init();
                this.state.dynamicValues.push(emptyField);
            }

            (this as any).setStateDirty('dynamicValues');
        }, 15);
    }

    public showValueInput(value: DynamicFormFieldValue): boolean {
        const newValue = value.getValue();
        return value.value.property && newValue && this.manager.showValueInput(newValue);
    }

    public getInputOptionValue(value: DynamicFormFieldValue, option: string): string | number {
        const inputOption = value.inputOptions.find((io) => io[0] === option);
        let returnValue: string | number = inputOption && inputOption[1] ? inputOption[1] : null;
        switch (option) {
            case 'maxLength':
                if (!returnValue || typeof returnValue === 'number') {
                    returnValue = 200;
                }
            default:
        }
        return returnValue;
    }

    public hasOption(option: ObjectPropertyValueOption, value: DynamicFormFieldValue): boolean {
        const hasOption = this.manager.hasOption(
            option, value ? value.value.property : null, value ? value.value.operator : null
        );
        return hasOption;
    }

}

module.exports = Component;
