import { Role, KIXObjectType, ObjectIcon, RoleProperty, DateTimeUtil, User, ValidObject } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";
import { LabelProvider } from "../LabelProvider";

export class RoleLabelProvider extends LabelProvider<Role> {

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

    public async getDisplayText(
        role: Role, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = role[property];

        switch (property) {
            case RoleProperty.ID:
                displayValue = role.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number = '', translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case RoleProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                const valid = validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case RoleProperty.CREATE_BY:
            case RoleProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case RoleProperty.CREATE_TIME:
            case RoleProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(role: Role, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return role.Name;
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
