import { ILabelProvider } from "..";
import {
    ObjectIcon, KIXObjectType, ConfigItemClassDefinition, KIXObject, ConfigItemClassProperty, DateTimeUtil,
    ConfigItemClassDefinitionProperty
} from "../../model";
import { ContextService } from "../context";

export class ConfigItemClassDefinitionLabelProvider implements ILabelProvider<ConfigItemClassDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public async getPropertyValueDisplayText(property: string, value: string | number | any = ''): Promise<string> {
        return value;
    }

    public async getPropertyText(property: string, object?: KIXObject, short?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemClassDefinitionProperty.VERSION:
                displayValue = 'Version';
                break;
            case ConfigItemClassProperty.CHANGE_BY:
                displayValue = 'Geändert von';
                break;
            case ConfigItemClassProperty.CREATE_TIME:
                displayValue = 'Erstellt am';
                break;
            case ConfigItemClassProperty.CREATE_BY:
                displayValue = 'Erstellt von';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getDisplayText(ciClassDefinition: ConfigItemClassDefinition, property: string): Promise<string> {
        let displayValue = ciClassDefinition[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case ConfigItemClassDefinitionProperty.CREATE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case ConfigItemClassDefinitionProperty.CREATE_BY:
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            default:
                displayValue = ciClassDefinition[property];
        }
        return displayValue;
    }

    public getDisplayTextClasses(ciClassDefinition: ConfigItemClassDefinition, property: string): string[] {
        return [];
    }

    public getObjectClasses(ciClassDefinition: ConfigItemClassDefinition): string[] {
        return [];
    }

    public isLabelProviderFor(ciClassDefinition: ConfigItemClassDefinition): boolean {
        return ciClassDefinition instanceof ConfigItemClassDefinition;
    }

    public async getObjectText(
        ciClassDefinition: ConfigItemClassDefinition, id: boolean = true, name: boolean = true
    ): Promise<string> {
        return ciClassDefinition.Class;
    }

    public getObjectAdditionalText(ciClassDefinition: ConfigItemClassDefinition): string {
        return null;
    }

    public getObjectIcon(ciClassDefinition: ConfigItemClassDefinition): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public getObjectTooltip(ciClassDefinition: ConfigItemClassDefinition): string {
        return ciClassDefinition.Class;
    }

    public getObjectName(plural: boolean = false): string {
        return plural ? "CMDB Klassen Definitionen" : "CMDB Klasse Definition";
    }

    public async getIcons(
        ciClassDefinition: ConfigItemClassDefinition, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        return [];
    }
}
