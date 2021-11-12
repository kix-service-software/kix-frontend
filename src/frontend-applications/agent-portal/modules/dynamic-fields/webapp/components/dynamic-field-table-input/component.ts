/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../../model/DynamicField';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

class Component extends FormInputComponent<string[], ComponentState> {

    private dynamicField: DynamicField;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.loadDynamicField();

        this.state.translations = TranslationService.createTranslationObject([
            'Translatable#Add initial table', 'Translatable#Remove table'
        ]);

        this.state.columns = this.dynamicField?.Config?.Columns;
        if (this.dynamicField?.Config?.TranslatableColumn) {
            for (let i = 0; i < this.state.columns.length; i++) {
                this.state.columns[i] = await TranslationService.translate(this.state.columns[i]);
            }
        }
        this.state.hasAction = this.dynamicField?.Config?.RowsMin !== this.dynamicField?.Config?.RowsMax;
        this.state.prepared = true;
    }

    public async addInitialTable(): Promise<void> {
        await this.loadDynamicField();
        const tableValues: Array<string[]> = [];
        const config = this.dynamicField?.Config;
        const min = config?.RowsMin;
        const max = config?.RowsMax;
        const init = config?.RowsInit;

        let rowCount = init > min && init < max
            ? config?.RowsInit
            : config?.RowsMin;

        if (rowCount <= 0) {
            rowCount = 1;
        } else if (rowCount > max) {
            rowCount = max;
        }

        for (let i = 0; i < rowCount; i++) {
            const row = [];
            config?.Columns?.forEach((c) => row.push(''));
            tableValues.push(row);
        }
        this.state.tableValues = tableValues;
        this.provideTableValue();
    }

    public removeTable(): void {
        this.state.tableValues = null;
        this.provideTableValue();
    }

    private provideTableValue(): void {
        const value = this.state.tableValues ? JSON.stringify(this.state.tableValues) : null;
        super.provideValue([value]);
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string | string[]>(this.state.field?.instanceId);
        if (value && value.value) {
            const tableValues = value.value;
            let fieldValue: Array<string[]> = [];
            if (typeof tableValues === 'string' && tableValues !== '') {
                fieldValue = JSON.parse(tableValues);
            } else if (Array.isArray(tableValues) && tableValues[0] !== '') {
                fieldValue = JSON.parse(tableValues[0]);
            }

            if (Array.isArray(fieldValue)) {
                this.state.tableValues = fieldValue;
            }
        } else {
            this.addInitialTable();
        }
    }

    private async loadDynamicField(): Promise<void> {
        if (!this.dynamicField) {
            const fieldNameOptions = this.state.field?.options?.find((o) => o.option === 'FIELD_NAME');
            this.state.translations = await TranslationService.createTranslationObject([
                'Translatable#Remove', 'Translatable#Add'
            ]);
            this.dynamicField = await KIXObjectService.loadDynamicField(fieldNameOptions?.value);
        }
    }

    public tableRowRemoved(index: number, event: any): void {
        this.state.tableValues.splice(index, 1);
        (this as any).setStateDirty('tableValues');
        this.provideTableValue();
    }

    public tableRowAdded(event: any): void {
        const colCount = this.state.columns.length;
        const newRow = [];

        for (let index = 0; index < colCount; index++) {
            newRow.push('');
        }

        this.state.tableValues.push(newRow);

        (this as any).setStateDirty('tableValues');
        this.provideTableValue();
    }

    public tableValueChanged(rowIndex: number, colIndex: number, event: any): void {
        this.state.tableValues[rowIndex][colIndex] = event.target.value;
        (this as any).setStateDirty('tableValues');
        this.provideTableValue();
    }

    public canRemove(index: number): boolean {
        const rowMin = Number(this.dynamicField?.Config?.RowsMin);
        const rowCount = this.state.tableValues?.length;
        return rowCount > rowMin;
    }

    public canAdd(index: number): boolean {
        const rowMax = Number(this.dynamicField?.Config?.RowsMax);
        const rowCount = this.state.tableValues?.length;
        return rowCount < rowMax && index === rowCount - 1;
    }
}

module.exports = Component;
