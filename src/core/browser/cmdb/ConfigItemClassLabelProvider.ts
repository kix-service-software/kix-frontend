import { ILabelProvider } from "..";
import {
    ObjectIcon, KIXObjectType, ConfigItemClass, KIXObject, ConfigItemClassProperty, DateTimeUtil
} from "../../model";
import { ContextService } from "../context";

export class ConfigItemClassLabelProvider implements ILabelProvider<ConfigItemClass> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    public async getPropertyValueDisplayText(property: string, value: string | number | any = ''): Promise<string> {
        let displayValue = value;
        const objectData = ContextService.getInstance().getObjectData();
        switch (property) {
            case ConfigItemClassProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case ConfigItemClassProperty.CREATE_BY:
            case ConfigItemClassProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID.toString() === displayValue.toString());
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case ConfigItemClassProperty.CREATE_TIME:
            case ConfigItemClassProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }
        return displayValue.toString();
    }

    public async getPropertyText(property: string, short?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemClassProperty.NAME:
                displayValue = 'Name';
                break;
            case ConfigItemClassProperty.CHANGE_TIME:
                displayValue = 'Geändert am';
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
            case ConfigItemClassProperty.COMMENT:
                displayValue = 'Kommentar';
                break;
            case ConfigItemClassProperty.VALID_ID:
                displayValue = 'Gültigkeit';
                break;
            case ConfigItemClassProperty.ID:
                displayValue = 'Icon';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(ciClass: ConfigItemClass, property: string): Promise<string> {
        let displayValue = ciClass[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case ConfigItemClassProperty.CREATE_BY:
            case ConfigItemClassProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case ConfigItemClassProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID === displayValue);
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case ConfigItemClassProperty.CREATE_TIME:
            case ConfigItemClassProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case ConfigItemClassProperty.ID:
                displayValue = ciClass.Name;
                break;
            default:
                displayValue = ciClass[property];
        }
        return displayValue;
    }

    public getDisplayTextClasses(ciClass: ConfigItemClass, property: string): string[] {
        return [];
    }

    public getObjectClasses(ciClass: ConfigItemClass): string[] {
        return [];
    }

    public isLabelProviderFor(ciClass: ConfigItemClass): boolean {
        return ciClass instanceof ConfigItemClass;
    }

    public async getObjectText(ciClass: ConfigItemClass, id: boolean = true, name: boolean = true): Promise<string> {
        return 'CMDB Klasse: ' + ciClass.Name;
    }

    public getObjectAdditionalText(ciClass: ConfigItemClass): string {
        return null;
    }

    public getObjectIcon(ciClass: ConfigItemClass): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public getObjectTooltip(ciClass: ConfigItemClass): string {
        return ciClass.Name;
    }

    public getObjectName(plural: boolean = false): string {
        return plural ? "CMDB Klassen" : "CMDB Klasse";
    }

    public async getIcons(
        ciClass: ConfigItemClass, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        let icons = [];
        if (ciClass) {
            switch (property) {
                case ConfigItemClassProperty.ID:
                    icons.push(new ObjectIcon(KIXObjectType.CONFIG_ITEM_CLASS, ciClass.ID));
                    break;
                default:
                    icons = [];
            }
        }
        return icons;
    }
}
