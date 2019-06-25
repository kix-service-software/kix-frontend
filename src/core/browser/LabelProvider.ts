import { ILabelProvider } from "./ILabelProvider";
import { KIXObjectType, ObjectIcon } from "../model";

export class LabelProvider<T = any> implements ILabelProvider<T> {

    public kixObjectType: KIXObjectType;

    public isLabelProviderFor(object: T): boolean {
        throw new Error("Method not implemented.");
    }

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getObjectText(object: T, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return object.toString();
    }

    public async getObjectName(plural?: boolean, translatable?: boolean): Promise<string> {
        return '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string> {
        return property;
    }

    public async getDisplayText(
        object: T, property: string, defaultValue?: string, translatable?: boolean
    ): Promise<string> {
        return '';
    }

    public getObjectAdditionalText(object: T, translatable?: boolean): string {
        return '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable?: boolean
    ): Promise<string> {
        return value ? value.toString() : '';
    }

    public getObjectTooltip(object: T, translatable?: boolean): string {
        return '';
    }

    public getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return null;
    }

    public getDisplayTextClasses(object: T, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: T): string[] {
        return [];
    }

    public getObjectIcon(object?: T): string | ObjectIcon {
        return null;
    }

    public async getIcons(object: T, property: string, value?: string | number): Promise<Array<(string | ObjectIcon)>> {
        return [];
    }

    public canShow(property: string, object: T): boolean {
        return true;
    }

}
