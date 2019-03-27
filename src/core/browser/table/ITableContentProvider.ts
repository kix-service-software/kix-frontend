import { IRowObject } from "./IRowObject";
import { KIXObjectType } from "../../model";

export interface ITableContentProvider<T = any> {

    initialize(): Promise<void>;

    getObjectType(): KIXObjectType;

    loadData(): Promise<Array<IRowObject<T>>>;

    destroy(): void;

}
