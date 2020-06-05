/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IRowObject } from './IRowObject';
import { TableValue } from './TableValue';
import { ValueState } from './ValueState';

export class RowObject<T = any> implements IRowObject<T> {

    private children: RowObject[] = [];
    private rowValueState: ValueState;

    public constructor(private values: TableValue[], private object?: T) { }

    public getValues(): TableValue[] {
        return this.values;
    }

    public getValueState(): ValueState {
        return this.rowValueState;
    }

    public setValueState(valueState: ValueState): void {
        this.rowValueState = valueState;
    }

    public getObject(): T {
        return this.object;
    }

    public addValue(value: TableValue): void {
        if (!this.values.some((v) => v.property === value.property)) {
            this.values.push(value);
        }
    }

    public getChildren(): RowObject[] {
        return this.children;
    }

    public addChild(rowObject: RowObject): void {
        this.children.push(rowObject);
    }
}
