import { IRowObject } from "./IRowObject";
import { TableValue } from "./TableValue";

export class RowObject<T = any> implements IRowObject<T> {

    private children: RowObject[] = [];

    public constructor(private values: TableValue[], private object?: T) { }

    public getValues(): TableValue[] {
        return this.values;
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
