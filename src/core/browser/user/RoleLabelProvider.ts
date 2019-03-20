import { ILabelProvider } from "../ILabelProvider";
import { Role, KIXObjectType, ObjectIcon, RoleProperty, DateTimeUtil } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";

export class RoleLabelProvider implements ILabelProvider<Role> {

    public kixObjectType: KIXObjectType = KIXObjectType.ROLE;

    public isLabelProviderFor(role: Role): boolean {
        return role instanceof Role;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case RoleProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case RoleProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case RoleProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case RoleProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case RoleProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case RoleProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case RoleProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case RoleProperty.ID:
                displayValue = 'Translatable#Icon';
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
        role: Role, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = role[property];

        const objectData = ObjectDataService.getInstance().getObjectData();

        switch (property) {
            case RoleProperty.CREATE_BY:
            case RoleProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case RoleProperty.CREATE_TIME:
            case RoleProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case RoleProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID === displayValue);
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case RoleProperty.ID:
                displayValue = role.Name;
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        switch (property) {
            case RoleProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case RoleProperty.CREATE_BY:
            case RoleProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID.toString() === displayValue.toString());
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case RoleProperty.CREATE_TIME:
            case RoleProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue.toString();
    }

    public getDisplayTextClasses(role: Role, property: string): string[] {
        return [];
    }

    public getObjectClasses(role: Role): string[] {
        return [];
    }

    public async getObjectText(role: Role, id?: boolean, title?: boolean): Promise<string> {
        const objectName = await this.getObjectName();
        return `${objectName}: ${role.Name}`;
    }

    public getObjectAdditionalText(role: Role): string {
        return null;
    }

    public getObjectIcon(role?: Role): string | ObjectIcon {
        return new ObjectIcon('Role', role.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Roles' : 'Translatable#Role'
            );
        }
        return plural ? 'Roles' : 'Role';
    }

    public getObjectTooltip(role: Role): string {
        return role.Name;
    }

    public async getIcons(
        role: Role, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === RoleProperty.ID) {
            return [new ObjectIcon('Role', role.ID)];
        }
        return null;
    }

}
