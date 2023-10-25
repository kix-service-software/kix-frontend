/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TableApplyAction } from '../actions/TableApplyAction';

export class DynamicFieldTableFormValue extends ObjectFormValue<Array<string[]>> {


    public columns: string[];
    public minRowCount: number;
    public maxRowCount: number;
    public initialRowCount: number;
    public translatableColumn: boolean;

    public tableValue: Array<string[]>;

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
        return [TableApplyAction, TableAddFormValueAction, TableRemoveFormValueAction];
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
        const config = dynamicField?.Config;

        this.translatableColumn = typeof config?.TranslatableColumn !== 'undefined'
            ? config.TranslatableColumn
            : true;

        this.columns = config?.Columns || [];
        this.minRowCount = Number(config?.RowsMin) || 1;
        this.maxRowCount = Number(config?.RowsMax) || 1;
        this.initialRowCount = Number(config?.RowsInit) || 1;

        const value = this.object[this.property];
        if (Array.isArray(value) && value.length) {
            this.value = value[0];
        } else {
            this.value = value;
        }

        if (!this.value) {
            this.addInitialTable();
        } else if (typeof this.value === 'string') {
            this.setFormValue(this.value, true);
        }
    }

    public async addInitialTable(): Promise<void> {
        const tableValues: Array<string[]> = [];

        let rowCount = this.initialRowCount > this.minRowCount && this.initialRowCount < this.maxRowCount
            ? this.initialRowCount
            : this.minRowCount;

        if (rowCount <= 0) {
            rowCount = 1;
        } else if (rowCount > this.maxRowCount) {
            rowCount = this.maxRowCount;
        }

        for (let i = 0; i < rowCount; i++) {
            const row = [];
            this.columns?.forEach((c) => row.push(''));
            tableValues.push(row);
        }

        this.value = tableValues;
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
    }

    public apply(): void {
        this.setFormValue(this.tableValue);
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

    // FIXME: field in frontend does not support more tables (no array value)
    protected async handlePlaceholders(value: any): Promise<any> {
        value = await super.handlePlaceholders(value);
        if (Array.isArray(value)) {
            value = value[0];
        }
        return value;
    }

}