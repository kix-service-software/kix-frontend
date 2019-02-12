import { KIXObject } from "../../../model";
import { ITableLayer } from "./ITableLayer";

export interface ITablePreventSelectionLayer<T extends KIXObject = KIXObject> extends ITableLayer {

    setPreventSelectionFilter(objects: T[]): void;

}
