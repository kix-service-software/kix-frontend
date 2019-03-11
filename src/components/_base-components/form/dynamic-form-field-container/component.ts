import { ComponentState } from './ComponentState';
import { TreeNode } from '../../../../core/model';
import { DynamicFieldValue } from './DynamicFormFieldValue';
import { ImportManager, ImportPropertyOperator } from '../../../../core/browser/import';
import { DialogService } from '../../../../core/browser/components/dialog';

class Component {

    private state: ComponentState;
    private manager: ImportManager;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.manager = input.manager;
    }

    public reset(): void {
        this.onMount();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true);
        if (this.manager) {
            await this.updateValues();
        }
        DialogService.getInstance().setMainDialogLoading(false);
    }

    public async propertyChanged(value: DynamicFieldValue, nodes: TreeNode[]): Promise<void> {
        await value.setPropertyNode(nodes && nodes.length ? nodes[0] : null);
        await value.setCurrentValue(null);
        await this.provideValue(value);
        await this.addEmptyValue();
        (this as any).setStateDirty();
    }

    public async operationChanged(value: DynamicFieldValue, nodes: TreeNode[]): Promise<void> {
        value.setOperationNode(nodes && nodes.length ? nodes[0] : null);
        await this.provideValue(value);
    }

    public async treeValueChanged(value: DynamicFieldValue, nodes: TreeNode[]): Promise<void> {
        value.setTreeValues(nodes);
        await this.provideValue(value);
    }

    public textValueChanged(value: DynamicFieldValue, event: any): void {
        setTimeout(async () => {
            const newValue = event.target.value;
            value.setTextValue(newValue);
            await this.provideValue(value);
        }, 100);
    }

    public async dateValueChanged(value: DynamicFieldValue, event: any): Promise<void> {
        const newValue = event.target.value;
        value.setDateValue(newValue);
        await this.provideValue(value);
    }

    public async timeValueChanged(value: DynamicFieldValue, event: any): Promise<void> {
        const newValue = event.target.value;
        value.setTimeValue(newValue);
        await this.provideValue(value);
    }

    public async provideValue(value: DynamicFieldValue): Promise<void> {
        await this.manager.setValue(value.getValue());
        await this.updateValues();
    }

    public async removeValue(value: DynamicFieldValue): Promise<void> {
        const index = this.state.dynamicValues.findIndex((sv) => sv.id === value.id);
        this.state.dynamicValues.splice(index, 1);
        await this.manager.removeValue(value.getValue());
        await this.updateValues();
    }

    public async searchCleared(): Promise<void> {
        this.state.dynamicValues = [];
    }

    private async addEmptyValue(): Promise<void> {
        const index = this.state.dynamicValues.findIndex((sv) => sv.currentPropertyNode === null);
        let emptyField: DynamicFieldValue;
        if (index === -1) {
            emptyField = new DynamicFieldValue(this.manager);
            await emptyField.setPropertyNode(null);
        } else {
            emptyField = this.state.dynamicValues.splice(index, 1)[0];
        }
        this.state.dynamicValues = [...this.state.dynamicValues, emptyField];
    }

    private async updateValues(): Promise<void> {
        for (const bv of this.state.dynamicValues) {
            await bv.setPropertyNode(bv.currentPropertyNode, true);
        }

        const values = [];
        const currentValues = this.manager.getValues();
        for (const cv of currentValues) {
            const existingValue = this.state.dynamicValues.find((bv) => bv.value.id === cv.id);
            if (existingValue) {
                existingValue.setOperationNode(null, cv.operator);
                existingValue.setCurrentValue(cv.value);
                values.push(existingValue);
            } else {
                const value = new DynamicFieldValue(this.manager, cv);
                await value.init();
                values.push(value);
            }
        }

        this.state.dynamicValues = [...values];
        this.addEmptyValue();
    }

    public showValueInput(value: DynamicFieldValue): boolean {
        const newValue = value.getValue();
        return newValue && newValue.property && newValue.operator
            && newValue.operator !== ImportPropertyOperator.IGNORE;
    }

    public getInputOptionValue(value: DynamicFieldValue, option: string): string | number {
        let returnValue: string | number = '';
        switch (option) {
            case 'maxlength':
                const inputOption = value.inputOptions.find((io) => io[0] === option);
                returnValue = inputOption && inputOption[1] && typeof inputOption[1] === 'number'
                    ? inputOption[1] : 200;
            default:
        }
        return returnValue;
    }

}

module.exports = Component;
