import { IWidgetContent } from "./IWidgetContent";
import { KIXObject } from "../..";

export class StringContent<T extends KIXObject<T>> implements IWidgetContent<T> {

    public constructor(private value: string, private actionObject?: T) { }

    public getValue(): string {
        return this.value;
    }

    public getActionObject(): T {
        return this.actionObject;
    }
}
