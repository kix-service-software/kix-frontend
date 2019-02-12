import { ILabelProvider } from "..";
import { ObjectIcon, KIXObjectType, LinkObject, LinkObjectProperty, KIXObject } from "../../model";
import { LabelService } from "../LabelService";

export class LinkObjectLabelProvider implements ILabelProvider<LinkObject> {

    public kixObjectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        let displayValue;

        switch (property) {
            case LinkObjectProperty.LINKED_OBJECT_TYPE:
                const labelProvider = LabelService.getInstance().getLabelProviderForType(value as KIXObjectType);
                if (labelProvider) {
                    displayValue = labelProvider.getObjectName(null);
                }
                break;
            default:
                displayValue = value;
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, object?: KIXObject): Promise<string> {
        let displayValue = property;
        switch (property) {
            case LinkObjectProperty.LINKED_OBJECT_TYPE:
                displayValue = 'Objekt';
                break;
            case LinkObjectProperty.LINKED_OBJECT_DISPLAY_ID:
                displayValue = 'Objekt ID';
                break;
            case LinkObjectProperty.TITLE:
                displayValue = 'Bezeichnung';
                break;
            case LinkObjectProperty.LINKED_AS:
                displayValue = 'Verknüpft als';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getDisplayText(linkObject: LinkObject, property: string): Promise<string> {
        const displayValue = typeof linkObject[property] !== 'undefined'
            ? await this.getPropertyValueDisplayText(property, linkObject[property]) : property;
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

    public getObjectName(plural: boolean = false): string {
        return plural ? "Verknüpfte Objekte" : "Verknüpftes Objekt";
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
