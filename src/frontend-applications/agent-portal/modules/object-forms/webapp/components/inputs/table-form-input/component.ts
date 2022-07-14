/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { DynamicFieldTableFormValue } from '../../../../model/FormValues/DynamicFields/DynamicFieldTableFormValue';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: DynamicFieldTableFormValue;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.update();
        }
    }

    private update(): void {
        this.bindingIds = [];

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.state.readonly = formValue.readonly;
            })
        );
        this.state.readonly = this.formValue?.readonly;
    }

    public async onMount(): Promise<void> {
        this.state.value = this.formValue?.value;

        this.state.columns = this.formValue?.columns;

        if (this.formValue.translatableColumn) {
            for (let i = 0; i < this.state.columns.length; i++) {
                this.state.columns[i] = await TranslationService.translate(this.state.columns[i]);
            }
        }
        this.state.hasAction = this.formValue.minRowCount !== this.formValue.maxRowCount;

        this.state.prepared = true;
    }

    public removeTable(): void {
        this.state.value = null;
        this.formValue?.setFormValue(null);
    }

    public tableValueChanged(rowIndex: number, colIndex: number, event: any): void {
        this.state.value[rowIndex][colIndex] = event.target.value;
        (this as any).setStateDirty('tableValues');
        this.formValue.setFormValue(this.state.value);
    }

    public tableRowRemoved(index: number, event: any): void {
        this.state.value.splice(index, 1);
        (this as any).setStateDirty('tableValues');
        this.formValue.setFormValue(this.state.value);
    }

    public tableRowAdded(event: any): void {
        const colCount = this.state.columns.length;
        const newRow = [];

        for (let index = 0; index < colCount; index++) {
            newRow.push('');
        }

        this.state.value.push(newRow);

        (this as any).setStateDirty('tableValues');
        this.formValue.setFormValue(this.state.value);
    }

    public canRemove(index: number): boolean {
        const rowMin = this.formValue.minRowCount;
        const rowCount = this.state.value?.length;
        return rowCount > rowMin;
    }

    public canAdd(index: number): boolean {
        const rowMax = this.formValue.maxRowCount;
        const rowCount = this.state.value?.length;
        return rowCount < rowMax && index === rowCount - 1;
    }

    public addInitialTable(): void {
        this.formValue.addInitialTable();
    }

}

module.exports = Component;