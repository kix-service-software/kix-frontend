import { ObjectIcon, KIXObjectType } from "../model";

export interface ILabelProvider<T> {

    kixObjectType: KIXObjectType;

    isLabelProviderFor(object: T): boolean;

    getObjectText(object: T, id?: boolean, title?: boolean, translatable?: boolean): Promise<string>;

    getObjectName(plural?: boolean, translatable?: boolean): Promise<string>;

    getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string>;

    getDisplayText(object: T, property: string, defaultValue?: string, translatable?: boolean): Promise<string>;

    getObjectAdditionalText(object: T, translatable?: boolean): string;

    getPropertyValueDisplayText(property: string, value: string | number, translatable?: boolean): Promise<string>;

    getObjectTooltip(object: T, translatable?: boolean): string;

    getPropertyIcon(property: string): Promise<string | ObjectIcon>;

    getDisplayTextClasses(object: T, property: string): string[];

    getObjectClasses(object: T): string[];

    getObjectIcon(object?: T): string | ObjectIcon;

    getIcons(object: T, property: string, value?: string | number): Promise<Array<string | ObjectIcon>>;

}
