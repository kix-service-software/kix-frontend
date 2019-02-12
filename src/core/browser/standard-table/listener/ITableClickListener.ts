import { KIXObject } from "../../../model";

export interface ITableClickListener<T extends KIXObject = KIXObject> {

    rowClicked(object: T, columnId: string, event: any): void;

}
