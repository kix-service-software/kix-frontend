/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { TableAddFormValueAction } from '../actions/TableAddFormValueAction';
import { TableRemoveFormValueAction } from '../actions/TableRemoveFormValueAction';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { FormValueAction } from '../FormValueAction';
import { ObjectFormValue } from '../ObjectFormValue';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';

export class DynamicFieldTableFormValue extends ObjectFormValue<Array<string[]>> {


    public columns: string[];
    public minRowCount: number;
    public maxRowCount: number;
    public initialRowCount: number;
    public translatableColumn: boolean;

    public tableValue: Array<string[]>;

    private setValueTimeout: any;
    private initialized: boolean = false;

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        protected dfName: string
    ) {
        super(property, object, objectValueMapper, parent);

        this.inputComponentId = 'table-form-input';
    }

    public getValueActionClasses(): Array<new (
        formValue: ObjectFormValue, objectValueMapper: ObjectFormValueMapper
    ) => FormValueAction> {
        return [TableAddFormValueAction, TableRemoveFormValueAction];
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await this.setDefaultTableSettings();
        await super.initFormValueByField(field);
    }

    protected async setDefaultValue(field: FormFieldConfiguration): Promise<void> {
        this.defaultValue = this.addInitialTable(false, field);
    }

    public async initFormValue(): Promise<void> {
        await this.setDefaultTableSettings();

        let value = this.object[this.property];
        if (Array.isArray(value) && value.length) {
            value = value[0];
        }

        if (typeof value === 'string') {
            value = JSON.parse(value);
        }

        if (!value) {
            value = this.defaultValue;
        }

        this.value = value;

        await this.prepareLabel();
        this.initialized = true;
    }

    private async setDefaultTableSettings(): Promise<void> {
        if (!this.initialized) {
            const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
            const config = dynamicField?.Config;

            this.translatableColumn = typeof config?.TranslatableColumn !== 'undefined'
                ? config.TranslatableColumn
                : true;

            this.columns = config?.Columns || [];
            this.minRowCount = Number(config?.RowsMin) || 1;
            this.maxRowCount = Number(config?.RowsMax) || 1;
            this.initialRowCount = Number(config?.RowsInit) || 1;
        }
    }

    public addInitialTable(setAsValue?: boolean, field?: FormFieldConfiguration): Array<string[]> {
        const tableValues: Array<string[]> = [];

        let rowCount: number;
        if (field?.defaultValue.value?.length > 0) {
            rowCount = field.defaultValue.value.length;
        } else {
            rowCount = this.initialRowCount;
        }

        if (rowCount <= 0) {
            rowCount = 1;
        } else if (rowCount > this.maxRowCount) {
            rowCount = this.maxRowCount;
        } else if (rowCount < this.minRowCount) {
            rowCount = this.minRowCount;
        }

        for (let i = 0; i < rowCount; i++) {
            const row = [];
            this.columns?.forEach((column, columnIndex) => {
                let rowValue = '';
                if (field?.defaultValue.value?.length > 0) {
                    rowValue = field.defaultValue.value[i][columnIndex] ?? '';
                }
                row.push(rowValue);
            });
            tableValues.push(row);
        }

        if (setAsValue) {
            this.value = tableValues;
        }

        return tableValues;
    }

    public async setObjectValue(value: Array<string[]>): Promise<void> {
        let v: string | Array<string[]> = value;
        if (Array.isArray(v)) {
            v = JSON.stringify(value);
        }
        await super.setObjectValue(v);
    }

    public setTableValue(value: Array<string[]>): void {
        this.tableValue = value;

        if (this.setValueTimeout) {
            clearTimeout(this.setValueTimeout);
        }

        this.setValueTimeout = setTimeout(() => this.setFormValue(this.tableValue), 1000);
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        try {
            let newValue;
            if (typeof value === 'string') {
                newValue = JSON.parse(value);
            } else {
                newValue = value;
            }
            super.setFormValue(newValue, force);

            this.tableValue = value;
        } catch (e) {
            console.error(e);
        }
    }

    protected async handlePlaceholders(value: any): Promise<any> {
        const newTableValues = [];
        if (Array.isArray(value)) {
            for (let rowValue of value) {
                const handledRowValue = await super.handlePlaceholders(rowValue);
                newTableValues.push(handledRowValue);
            }
        }
        return newTableValues;
    }

}