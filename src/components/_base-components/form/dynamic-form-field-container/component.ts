/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeNode } from '../../../../core/model';
import { DynamicFieldValue } from './DynamicFormFieldValue';
import { IDynamicFormManager, ObjectPropertyValue } from '../../../../core/browser';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component {

    private state: ComponentState;
    private manager: IDynamicFormManager;
    private provideTimeout: any;

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
        const values = [];
        const currentValues = this.manager.getValues();
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
                values.push(existingValue);
            } else {
                const value = new DynamicFieldValue(this.manager, cv);
                await value.init();
                values.push(value);
            }
        }
        await this.addEmptyValue(values);
        this.state.dynamicValues = [...values];
        if (this.manager.uniqueProperties) {
            this.state.dynamicValues.forEach((dv) => dv.updateProperties());
        }
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Remove parameter"
        ]);
        if (this.manager) {
            this.manager.init();
            for (const v of this.manager.getValues()) {
                const formFieldValue = new DynamicFieldValue(this.manager, new ObjectPropertyValue(
                    v.property, v.operator, v.value, v.required, v.valid,
                    v.objectType, v.readonly, v.changeable, v.id
                ));
                await formFieldValue.init();
                this.state.dynamicValues.push(formFieldValue);
            }

            this.addEmptyValue();
            this.state.prepared = true;
        }
    }

    public async propertyChanged(value: DynamicFieldValue, nodes: TreeNode[]): Promise<void> {
        await value.setProperty(nodes && nodes.length ? nodes[0].id : null, true);
        if (await this.manager.clearValueOnPropertyChange(value.getValue().property)) {
            value.clearValue();
        }

        await this.provideValue(value);
    }

    public async operationChanged(value: DynamicFieldValue, nodes: TreeNode[]): Promise<void> {
        await value.setOperator(nodes && nodes.length ? nodes[0].id : null);
        await this.provideValue(value);
    }

    public async operationStringChanged(value: DynamicFieldValue, event: any): Promise<void> {
        const operationString = event.target.value;
        value.setOperator(operationString);
        await this.provideValue(value);
    }

    public async treeValueChanged(value: DynamicFieldValue, nodes: TreeNode[]): Promise<void> {
        value.setValue(nodes.map((n) => n.id));
        await this.provideValue(value);
    }

    public async setValue(value: DynamicFieldValue, event: any): Promise<void> {
        const newValue = event.target.value;
        value.setValue(newValue);
        await this.provideValue(value);
    }

    public async setDateValue(value: DynamicFieldValue, event: any): Promise<void> {
        const newValue = event.target.value;
        value.setDateValue(newValue);
        await this.provideValue(value);
    }

    public async setTimeValue(value: DynamicFieldValue, event: any): Promise<void> {
        const newValue = event.target.value;
        value.setTimeValue(newValue);
        await this.provideValue(value);
    }

    public async setBetweenEndDateValue(value: DynamicFieldValue, event: any): Promise<void> {
        const date = event.target.value;
        value.setBetweenEndDateValue(date);
        await this.provideValue(value);
    }

    public async setBetweenEndTimeValue(value: DynamicFieldValue, event: any): Promise<void> {
        const time = event.target.value;
        value.setBetweenEndTimeValue(time);
        await this.provideValue(value);
    }


    public async setSpecificValue(value: DynamicFieldValue, emittedValue: any): Promise<void> {
        value.setValue(emittedValue);
        await this.provideValue(value);
    }

    public async provideValue(value: DynamicFieldValue): Promise<void> {
        await this.manager.setValue(value.getValue());
        if (!this.provideTimeout) {
            this.provideTimeout = setTimeout(async () => {
                this.provideTimeout = null;
                await this.updateValues();
            }, 200);
        }
    }

    public async removeValue(value: DynamicFieldValue): Promise<void> {
        await this.manager.removeValue(value.getValue());
        await this.updateValues();
    }

    private async addEmptyValue(newValues?: DynamicFieldValue[]): Promise<void> {
        if (await this.manager.shouldAddEmptyField()) {
            const index = this.state.dynamicValues.findIndex((sv) => sv.getValue().property === null);
            let emptyField: DynamicFieldValue;
            if (index === -1 || newValues) {
                emptyField = new DynamicFieldValue(this.manager);
                await emptyField.init();
            } else {
                emptyField = this.state.dynamicValues.splice(index, 1)[0];
            }
            if (newValues) {
                newValues.push(emptyField);
            } else {
                this.state.dynamicValues = [...this.state.dynamicValues, emptyField];
            }
        }
    }

    public showValueInput(value: DynamicFieldValue): boolean {
        const newValue = value.getValue();
        return value.value.property && newValue && this.manager.showValueInput(newValue);
    }

    public getInputOptionValue(value: DynamicFieldValue, option: string): string | number {
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

}

module.exports = Component;
