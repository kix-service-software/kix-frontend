import { ILabelProvider } from "..";
import { ObjectIcon, KIXObjectType, LinkObject, LinkObjectProperty, KIXObject } from "../../model";
import { LabelService } from "../LabelService";
import { TranslationService } from "../i18n/TranslationService";

export class LinkObjectLabelProvider implements ILabelProvider<LinkObject> {

    public kixObjectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue;

        switch (property) {
            case LinkObjectProperty.LINKED_OBJECT_TYPE:
                const labelProvider = LabelService.getInstance().getLabelProviderForType(value as KIXObjectType);
                if (labelProvider) {
                    displayValue = await labelProvider.getObjectName(null);
                }
                break;
            default:
                displayValue = value;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case LinkObjectProperty.LINKED_OBJECT_TYPE:
                displayValue = 'Translatable#Object';
                break;
            case LinkObjectProperty.LINKED_OBJECT_DISPLAY_ID:
                displayValue = 'Translatable#Object Id';
                break;
            case LinkObjectProperty.TITLE:
                displayValue = 'Translatable#Label';
                break;
            case LinkObjectProperty.LINKED_AS:
                displayValue = 'Translatable#Linked as';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        linkObject: LinkObject, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof linkObject[property] !== 'undefined'
            ? await this.getPropertyValueDisplayText(property, linkObject[property]) : property;

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(linkObject: LinkObject, property: string): string[] {
        return [];
    }

    public getObjectClasses(linkObject: LinkObject): string[] {
        return [];
    }

    public isLabelProviderFor(linkObject: LinkObject): boolean {
        return linkObject instanceof LinkObject;
    }

    public async getObjectText(linkObject: LinkObject): Promise<string> {
        return linkObject.title;
    }

    public getObjectAdditionalText(linkObject: LinkObject): string {
        return null;
    }

    public getObjectIcon(linkObject: LinkObject): string | ObjectIcon {
        return 'kix-icon-link';
    }

    public getObjectTooltip(linkObject: LinkObject): string {
        return linkObject.title;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? "Linked Objects" : "Linked Object";
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }

        return displayValue;
    }

    public async getIcons(object: LinkObject, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === LinkObjectProperty.LINKED_OBJECT_TYPE) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(object.linkedObjectType);
            if (labelProvider) {
                const icon = labelProvider.getObjectIcon(object);
                if (icon) {
                    icons.push(icon);
                }
            }
        }
        return icons;
    }

}
