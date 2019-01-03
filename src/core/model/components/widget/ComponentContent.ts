import { IWidgetContent } from "./IWidgetContent";
import { KIXObject } from "../..";

export class ComponentContent<T extends KIXObject<T>> implements IWidgetContent<T> {

    public constructor(private componentId: string, private componentData: any, private actionobject?: T) { }

    public getValue(): string {
        return this.componentId;
    }

    public getComponentData(): any {
        return this.componentData;
    }

    public getActionObject(): T {
        return this.actionobject;
    }

}
