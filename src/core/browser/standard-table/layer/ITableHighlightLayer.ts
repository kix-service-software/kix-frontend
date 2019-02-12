import { KIXObject } from "../../../model";
import { ITableLayer } from "./ITableLayer";

export interface ITableHighlightLayer<T extends KIXObject = KIXObject> extends ITableLayer {

    setHighlightedObjects(objects: T[]): void;

}
