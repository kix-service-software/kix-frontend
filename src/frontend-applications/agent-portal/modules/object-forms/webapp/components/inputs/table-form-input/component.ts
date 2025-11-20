/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ObjectFormEventData } from '../../../../model/ObjectFormEventData';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: DynamicFieldTableFormValue;

    public onCreate(input: any): void {
        super.onCreate(input, 'inputs/table-form-input');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
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

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.VALUE, (formValue: ObjectFormValue) => {
                this.state.value = this.createNewTable(formValue.value);
                if (!this.state.value || Array.isArray(this.state.value) && !this.state.value.length) {
                    this.removeTable();
                }
            })
        );

        this.state.readonly = this.formValue?.readonly;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        if (this.formValue) {
            this.state.value = this.createNewTable(this.formValue.value);
        }

        this.state.columns = this.formValue?.columns;

        if (this.formValue.translatableColumn) {
            for (let i = 0; i < this.state.columns.length; i++) {
                this.state.columns[i] = await TranslationService.translate(this.state.columns[i]);
            }
        }
        this.state.hasAction = this.formValue.minRowCount !== this.formValue.maxRowCount;

        this.state.prepared = true;

        super.registerEventSubscriber(
            function (data: ObjectFormEventData, eventId: string): void {
                if (this.context?.instanceId === data.contextInstanceId) {
                    if (data.blocked) {
                        this.state.readonly = true;
                    } else {
                        this.state.readonly = this.formValue.readonly;
                    }
                }
            },
            [ObjectFormEvent.BLOCK_FORM]
        );
    }

    // create new, to not use ref, else "isNotSame" check will fail in ObjectFormValue (setFormValue)
    private createNewTable(value): Array<Array<any>> {
        const newTable = [];
        if (Array.isArray(value)) {
            value.forEach((r) => {
                if (Array.isArray(r)) {
                    const newRow = [];
                    r.forEach((c) => newRow.push(c));
                    newTable.push(newRow);
                }
            });
        }
        return newTable;
    }

    public onDestroy(): void {
        super.onDestroy();

        if (this.bindingIds?.length && this.formValue) {
            this.formValue.removePropertyBinding(this.bindingIds);
        }
    }

    public removeTable(): void {
        this.state.value = null;
        this.formValue?.setTableValue(null);
    }

    public tableValueChanged(rowIndex: number, colIndex: number, event: any): void {
        this.state.value[rowIndex][colIndex] = event.target.value;
        this.formValue.setTableValue(this.state.value);
    }

    public tableRowRemoved(index: number, event: any): void {
        this.state.prepared = false;
        this.state.value.splice(index, 1);
        (this as any).setStateDirty('tableValues');
        this.formValue.setTableValue(this.state.value);
        setTimeout(() => this.state.prepared = true, 10);
    }

    public tableRowAdded(event: any): void {
        const colCount = this.state.columns.length;
        const newRow = [];

        for (let index = 0; index < colCount; index++) {
            newRow.push('');
        }

        this.state.value.push(newRow);

        (this as any).setStateDirty('tableValues');
        this.formValue.setTableValue(this.state.value);
    }

    public canRemove(index: number): boolean {
        if (!this.state.value) return false;
        const rowMin = this.formValue.minRowCount;
        const rowCount = this.state.value?.length;
        return rowCount > rowMin;
    }

    public canAdd(index: number): boolean {
        if (!this.state.value) return true;
        const rowMax = this.formValue.maxRowCount;
        const rowCount = this.state.value?.length;
        return rowCount < rowMax && index === rowCount - 1;
    }

}

module.exports = Component;