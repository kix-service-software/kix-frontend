import { KIXObject } from "../..";

export interface IWidgetContent<T extends KIXObject<T>> {

    getValue(): string;

    getActionObject(): T;

}
