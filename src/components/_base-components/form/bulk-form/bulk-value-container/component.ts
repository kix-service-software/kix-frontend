import { ComponentState } from './ComponentState';
import { DialogService, PropertyOperator } from '../../../../../core/browser';
import { TreeNode } from '../../../../../core/model';
import { BulkValue } from './BulkValue';
import { BulkManager } from '../../../../../core/browser/bulk';

class Component {

    private state: ComponentState;
    private bulkManager: BulkManager;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.bulkManager = input.bulkManager;
    }

    public reset(): void {
        this.onMount();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true);
        await this.updateValues();
        DialogService.getInstance().setMainDialogLoading(false);
    }

    public async propertyChanged(bulkValue: BulkValue, nodes: TreeNode[]): Promise<void> {
        await bulkValue.setPropertyNode(nodes && nodes.length ? nodes[0] : null);
        await bulkValue.setCurrentValue(null);
        await this.provideBulkValue(bulkValue);
        await this.addEmptyBulkValue();
        (this as any).setStateDirty();
    }

    public async operationChanged(bulkValue: BulkValue, nodes: TreeNode[]): Promise<void> {
        bulkValue.setOperationNode(nodes && nodes.length ? nodes[0] : null);
        await this.provideBulkValue(bulkValue);
    }

    public async treeValueChanged(bulkValue: BulkValue, nodes: TreeNode[]): Promise<void> {
        bulkValue.setTreeValues(nodes);
        await this.provideBulkValue(bulkValue);
    }

    public textValueChanged(bulkValue: BulkValue, event: any): void {
        setTimeout(async () => {
            const value = event.target.value;
            bulkValue.setTextValue(value);
            await this.provideBulkValue(bulkValue);
        }, 100);
    }

    public async dateValueChanged(bulkValue: BulkValue, event: any): Promise<void> {
        const value = event.target.value;
        bulkValue.setDateValue(value);
        await this.provideBulkValue(bulkValue);
    }

    public async timeValueChanged(bulkValue: BulkValue, event: any): Promise<void> {
        const value = event.target.value;
        bulkValue.setTimeValue(value);
        await this.provideBulkValue(bulkValue);
    }

    public async provideBulkValue(bulkValue: BulkValue): Promise<void> {
        await this.bulkManager.setValue(bulkValue.getBulkValue());
        await this.updateValues();
    }

    public async removeValue(bulkValue: BulkValue, removeFromForm: boolean = true): Promise<void> {
        const index = this.state.bulkValues.findIndex((sv) => sv.id === bulkValue.id);
        this.state.bulkValues.splice(index, 1);
        await this.bulkManager.removeValue(bulkValue.getBulkValue());
        await this.updateValues();
    }

    public async searchCleared(): Promise<void> {
        this.state.bulkValues = [];
    }

    private async addEmptyBulkValue(): Promise<void> {
        const index = this.state.bulkValues.findIndex((sv) => sv.currentPropertyNode === null);
        let emptyField: BulkValue;
        if (index === -1) {
            emptyField = new BulkValue(this.bulkManager);
            await emptyField.setPropertyNode(null);
        } else {
            emptyField = this.state.bulkValues.splice(index, 1)[0];
        }
        this.state.bulkValues = [...this.state.bulkValues, emptyField];
    }

    private async updateValues(): Promise<void> {
        for (const bv of this.state.bulkValues) {
            await bv.setPropertyNode(bv.currentPropertyNode, true);
        }

        const values = [];
        const currentValues = this.bulkManager.getBulkValues();
        for (const cv of currentValues) {
            const existingValue = this.state.bulkValues.find((bv) => bv.bulkValue.id === cv.id);
            if (existingValue) {
                existingValue.setOperationNode(null, cv.operator);
                existingValue.setCurrentValue(cv.value);
                values.push(existingValue);
            } else {
                const bulkValue = new BulkValue(this.bulkManager, cv);
                await bulkValue.init();
                values.push(bulkValue);
            }
        }

        this.state.bulkValues = [...values];
        this.addEmptyBulkValue();
    }

    public showValueInput(bulkValue: BulkValue): boolean {
        const value = bulkValue.getBulkValue();
        return value && value.property && value.operator && value.operator !== PropertyOperator.CLEAR;
    }

}

module.exports = Component;
