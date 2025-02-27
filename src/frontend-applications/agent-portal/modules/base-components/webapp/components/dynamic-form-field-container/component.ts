/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TimeoutTimer } from '../../core/TimeoutTimer';

declare const JSONEditor: any;

class Component {

    private state: ComponentState;
    private manager: IDynamicFormManager;
    private provideTimeout: any;

    private advancedOptionsMap: Map<string, boolean>;
    private optionEditor: Map<string, any>;
    private additionalOptionsTimeout: any;
    private timoutTimer: TimeoutTimer;
    private updateTimeout: any;

    private dragInterval: any;
    private dragoverListener: any;
    private mouseY: number;

    private updatePromiseResolve: () => void;

    public onCreate(): void {
        this.state = new ComponentState();
        this.timoutTimer = new TimeoutTimer();
    }

    public onInput(input: any): void {
        this.manager = input.manager;
        this.state.invalid = input.invalid;
    }

    public reset(): void {
        this.onMount();
    }

    public async updateValues(): Promise<void> {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            // resolve potential previous promise
            if (this.updatePromiseResolve) {
                this.updatePromiseResolve();
            }
        }
        return new Promise<void>((resolve, reject) => {
            this.updatePromiseResolve = resolve;
            this.updateTimeout = setTimeout(async () => {

                const currentValues = this.manager.getValues();

                this.state.dynamicValues = this.state.dynamicValues.filter(
                    (dv) => currentValues.some((cv) => cv.id === dv.id)
                );

                // use index, to keep sort order
                let index = 0;
                for (const cv of currentValues) {
                    const existingValue = this.state.dynamicValues.find((bv) => bv.value.id === cv.id);
                    if (existingValue) {

                        if (existingValue.value.operator !== cv.operator) {
                            await existingValue.setOperator(cv.operator);
                        }

                        if (!existingValue.value.operator) {
                            existingValue.setOperationTree();
                        }

                        if (cv.reloadValueTree) {
                            cv.reloadValueTree = undefined;
                            existingValue.reloadValueTree();
                        }

                        if (existingValue.value.value !== cv.value) {
                            existingValue.setValue(cv.value);
                            existingValue.setCurrentValue(true);
                        }

                        existingValue.required = cv.required;
                        if (existingValue.required) {
                            await existingValue.setLabel();
                        }

                        existingValue.value.valid = cv.valid;
                        existingValue.value.validErrorMessages = cv.validErrorMessages;
                    } else {
                        const value = new DynamicFormFieldValue(this.manager, cv, cv.id);
                        await value.init();
                        this.state.dynamicValues.splice(index, 0, value);
                    }
                    index++;
                }

                let removeInstanceIds = [];
                if (this.manager.uniqueProperties) {
                    const updatePromises = [];
                    this.state.dynamicValues.forEach((dv) => updatePromises.push(dv.updateProperties()));
                    removeInstanceIds = await Promise.all(updatePromises);
                }

                const toRemove = this.state.dynamicValues.filter(
                    (dv) => removeInstanceIds.some((ri) => ri === dv.instanceId)
                );
                if (toRemove.length) {
                    toRemove.forEach((p) => this.removeValue(p, false));
                }

                this.state.dynamicValues = this.state.dynamicValues.sort((a, b) => a.required ? -1 : 0);

                await this.addEmptyValue();

                this.state.dynamicValues.forEach((v) => {
                    if (!this.advancedOptionsMap.has(v.instanceId)) {
                        this.advancedOptionsMap.set(v.instanceId, false);
                    }
                });

                (this as any).setStateDirty('dynamicValues');
                this.updatePromiseResolve = undefined;
                resolve();
            }, 800);
        });
    }

    public async onMount(): Promise<void> {

        this.advancedOptionsMap = new Map();
        this.optionEditor = new Map();

        this.dragoverListener = document.addEventListener('dragover', (event) => {
            event.preventDefault();
            this.mouseY = event.clientY;
        });

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Remove parameter'
        ]);
        if (this.manager) {
            this.manager.init();

            const initPromises = [];
            const values: DynamicFormFieldValue[] = [];
            for (const v of this.manager.getValues()) {
                const formFieldValue = new DynamicFormFieldValue(
                    this.manager,
                    new ObjectPropertyValue(
                        v.property, v.operator, v.value, v.options, v.required, v.valid,
                        v.objectType, v.readonly, v.changeable, v.id, v.additionalOptions,
                        v.validErrorMessages, v.hint, v.locked, v.valueChangeable
                    ),
                    v.id
                );
                initPromises.push(formFieldValue.init());
                values.push(formFieldValue);
            }

            await Promise.all(initPromises);

            values.forEach((v) => this.advancedOptionsMap.set(v.instanceId, false));

            this.state.dynamicValues = values.sort((a, b) => a.required ? -1 : 0);

            this.state.options = await this.manager.getFieldOptions();

            this.state.hasAdditionalOptions = this.manager.hasAdditionalOptions();

            await this.addEmptyValue();
        }
    }

    public onDestroy(): void {
        if (this.dragoverListener) {
            document.removeEventListener('dragover', this.dragoverListener);
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

    public dateValueChanged(value: DynamicFormFieldValue, event: any): void {
        this.timoutTimer.restartTimer(() => this.setDateValue(value, event), 1200);
    }

    private setDateValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setDateValue(newValue);
        this.provideValue(value);
    }

    public setTimeValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setTimeValue(newValue);
        this.provideValue(value);

    }

    public setRelativeTimeValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setRelativeTimeValue(newValue);
        this.provideValue(value);
    }

    public setRelativeUnitValue(value: DynamicFormFieldValue, nodes: TreeNode[]): void {
        value.setRelativeTimeUnitValue(nodes.map((n) => n.id).pop() as string);
        this.provideValue(value);
    }

    public setWithinStartType(value: DynamicFormFieldValue, nodes: TreeNode[]): void {
        value.setWithinStartType(nodes.map((n) => n.id).pop() as string);
        this.provideValue(value);
    }

    public setWithinStartValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setWithinStartValue(newValue);
        this.provideValue(value);
    }

    public setWithinStartUnit(value: DynamicFormFieldValue, nodes: TreeNode[]): void {
        value.setWithinStartUnit(nodes.map((n) => n.id).pop() as string);
        this.provideValue(value);
    }

    public setWithinEndType(value: DynamicFormFieldValue, nodes: TreeNode[]): void {
        value.setWithinEndType(nodes.map((n) => n.id).pop() as string);
        this.provideValue(value);
    }

    public setWithinEndValue(value: DynamicFormFieldValue, event: any): void {
        const newValue = event.target.value;
        value.setWithinEndValue(newValue);
        this.provideValue(value);
    }

    public setWithinEndUnit(value: DynamicFormFieldValue, nodes: TreeNode[]): void {
        value.setWithinEndUnit(nodes.map((n) => n.id).pop() as string);
        this.provideValue(value);
    }

    public betweenDateValueChanged(value: DynamicFormFieldValue, event: any): void {
        this.timoutTimer.restartTimer(() => this.setBetweenEndDateValue(value, event), 1200);
    }

    private setBetweenEndDateValue(value: DynamicFormFieldValue, event: any): void {
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

    public async provideValue(value: DynamicFormFieldValue, updateValues: boolean = true): Promise<void> {
        await this.manager.setValue(value.getValue());

        if (updateValues) {
            if (this.provideTimeout) {
                clearTimeout(this.provideTimeout);
            }

            this.provideTimeout = setTimeout(async () => {
                this.provideTimeout = null;
                await this.updateValues();
            }, 50);
        }
    }

    public async removeValue(value: DynamicFormFieldValue, updateValues: boolean = true): Promise<void> {
        this.state.dynamicValues = this.state.dynamicValues.filter((dv) => dv.instanceId !== value.instanceId);
        await this.manager.removeValue(value.getValue());
        if (updateValues) {
            await this.updateValues();
        }
    }

    private async addEmptyValue(): Promise<void> {
        const canAddEmptyValue = await this.manager.shouldAddEmptyField();
        const emptyValueIndex = this.state.dynamicValues.findIndex((sv) => sv.getValue().property === null);

        if (canAddEmptyValue) {
            if (emptyValueIndex === -1) {
                const emptyField = new DynamicFormFieldValue(this.manager);
                await emptyField.init();
                this.state.dynamicValues.push(emptyField);
            } else if (emptyValueIndex < this.state.dynamicValues.length - 1) {
                const emptyField = this.state.dynamicValues.splice(emptyValueIndex, 1);
                this.state.dynamicValues.push(...emptyField);
            }
        }

        (this as any).setStateDirty('dynamicValues');
    }

    public showValueInput(value: DynamicFormFieldValue): boolean {
        const newValue = value.getValue();
        return value.value.property && newValue && this.manager.showValueInput(newValue);
    }

    public getInputOptionValue(value: DynamicFormFieldValue, option: string): string | number {
        const inputOption = value.inputOptions.find((io) => io[0] === option);
        const returnValue: string | number = inputOption && inputOption[1] ? inputOption[1] : null;
        return returnValue;
    }

    public hasOption(option: ObjectPropertyValueOption, value: DynamicFormFieldValue): boolean {
        const hasOption = this.manager.hasOption(
            option, value ? value.value.property : null, value ? value.value.operator : null
        );
        return hasOption;
    }

    public canDraggable(): boolean {
        return this.manager.valuesAreDraggable();
    }

    public allowDrop(event): boolean {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        return false;
    }

    public handleDragEnter(event): void {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.add('drag-over');
    }

    public handleDragLeave(event): void {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.remove('drag-over');
    }

    public async handleDrop(index: number, event): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        if (this.dragInterval) {
            clearInterval(this.dragInterval);
            this.dragInterval = null;
        }

        await this.manager.changeValueOrder(this.state.dragStartIndex, index);
        this.sortLocalValues(this.state.dragStartIndex, index);

        this.state.dragStartIndex = null;
    }

    private sortLocalValues(currentIndex: number, targetIndex: number): void {
        const newIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;
        const value = this.state.dynamicValues.splice(currentIndex, 1);
        this.state.dynamicValues.splice(newIndex, 0, value[0]);

        // "drop" and set dynamicValues (necessary for richtext editors to remain editable)
        const values = this.state.dynamicValues;
        this.state.dynamicValues = [];
        setTimeout(() => {
            this.state.dynamicValues = values;
        }, 50);
    }

    // field triggered functions
    public setDraggable(id: string, draggable: boolean, event?: any): void {
        event.stopPropagation();
        event.preventDefault();

        // do nothing if event triggert from child node or dragging is not allowed
        if (!this.canDraggable() || !event?.srcElement?.classList.contains('drag-button')) {
            return;
        }

        this.state.draggableValueId = draggable ? id : null;
    }

    public handleDragStart(id: string, index: number, event): void {
        event.stopPropagation();
        const scrollContainer = document.getElementsByClassName('content-wrapper')[0];
        const topScrollThreshold = 175;
        const bottomScrollThreshold = 100;
        const scrollSpeed = 15;
        this.dragInterval = setInterval(() => {
            if (this.mouseY < topScrollThreshold) {
                scrollContainer.scrollBy(0, -scrollSpeed);
            } else if (window.innerHeight - this.mouseY < bottomScrollThreshold) {
                scrollContainer.scrollBy(0, scrollSpeed);
            }
        }, 20);

        const valueElement = (this as any).getEl(id);
        if (valueElement) {
            valueElement.classList.add('dragging');
        }
        event.dataTransfer.setData('Text', id);
        this.state.dragStartIndex = index;
    }

    public handleDragEnd(id: string, event): void {
        event.stopPropagation();

        if (this.dragInterval) {
            clearInterval(this.dragInterval);
            this.dragInterval = null;
        }

        const valueElement = (this as any).getEl(id);
        if (valueElement) {
            valueElement.classList.remove('dragging');
        }
        this.state.dragStartIndex = null;
    }

    public autoGrow(event: any): void {
        if (event?.target && event.target.scrollHeight > event.target.clientHeight) {
            event.target.style.height = (event.target.scrollHeight + 2) + 'px';
        }
    }

    public showAdditionalOptions(value: DynamicFormFieldValue): boolean {
        return this.advancedOptionsMap.get(value.instanceId);
    }

    public toggleAdvancedOptions(value: DynamicFormFieldValue): void {
        if (this.advancedOptionsMap.has(value.instanceId)) {
            const show = !this.advancedOptionsMap.get(value.instanceId);
            this.advancedOptionsMap.set(value.instanceId, show);

            if (show) {
                setTimeout(() => {
                    const container = document.getElementById('jsoneditor' + value.instanceId);
                    const options = {
                        search: false,
                        history: false,
                        mode: 'code',
                        onChange: (): void => {
                            if (this.additionalOptionsTimeout) {
                                window.clearTimeout(this.additionalOptionsTimeout);
                            }

                            this.additionalOptionsTimeout = setTimeout(() => {
                                try {
                                    value.value.additionalOptions = this.optionEditor.get(value.instanceId)?.get();
                                } catch (e) {
                                    value.value.additionalOptions = [];
                                }

                                this.provideValue(value);
                            }, 200);
                        }
                    };

                    const editor = new JSONEditor(container, options);
                    this.optionEditor.set(value.instanceId, editor);
                    editor?.set(value.value.additionalOptions);
                }, 100);
            } else {
                this.optionEditor.get(value.instanceId).destroy();
            }

            (this as any).setStateDirty('dynamicValues');
        }
    }

    public hintValueChanged(value: DynamicFormFieldValue, event: any): void {
        this.timoutTimer.restartTimer(() => {
            const hint = event.target.value;
            value.value.hint = hint;
            this.provideValue(value, false);
        }, 500);
    }

}

module.exports = Component;
