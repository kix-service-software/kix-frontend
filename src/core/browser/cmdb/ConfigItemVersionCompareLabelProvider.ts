import { ILabelProvider } from "..";
import { Version, ObjectIcon, KIXObjectType, VersionProperty } from "../../model";
import { ContextService } from "../context";

export class ConfigItemVersionCompareLabelProvider implements ILabelProvider<Version> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION_COMPARE;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value ? value.toString() : '';
    }

    public async getPropertyText(property: string): Promise<string> {
        let text = property;
        switch (property) {
            case 'CONFIG_ITEM_ATTRIBUTE':
                text = 'Attribute';
                break;
            default:
                text = property;
        }
        return text;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(version: Version, property: string, value?: string | number): Promise<string> {
        let displayValue = property.toString();

        switch (property) {
            case 'CONFIG_ITEM_ATTRIBUTE':
                displayValue = displayValue + ' from LP';
                break;
            default:
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: Version, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: Version): string[] {
        return [];
    }

    public isLabelProviderFor(object: Version): boolean {
        return object instanceof Version;
    }

    public async getObjectText(object: Version): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public getObjectAdditionalText(object: Version): string {
        throw new Error("Method not implemented.");
    }

    public getObjectIcon(object: Version): string | ObjectIcon {
        throw new Error("Method not implemented.");
    }

    public getObjectTooltip(object: Version): string {
        throw new Error("Method not implemented.");
    }

    public getObjectName(): string {
        return "Config Item Version Compare";
    }

    public async getIcons(object: Version, property: string): Promise<Array<string | ObjectIcon>> {
        return null;
    }

}
