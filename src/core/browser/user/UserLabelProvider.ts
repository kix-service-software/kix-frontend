import { ILabelProvider } from "../ILabelProvider";
import { User, KIXObjectType, UserProperty, ObjectIcon, DateTimeUtil } from "../../model";
import { ObjectDataService } from "../ObjectDataService";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";


export class UserLabelProvider implements ILabelProvider<User> {

    public kixObjectType: KIXObjectType = KIXObjectType.USER;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case UserProperty.CREATE_BY:
                case UserProperty.CHANGE_BY:
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value], null, null, true, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && !!users.length ? users[0].UserFullname : value;
                    break;
                case UserProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                default:
            }
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: User): boolean {
        return object instanceof User;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case UserProperty.USER_TITLE:
                displayValue = 'Translatable#Title';
                break;
            case UserProperty.USER_FIRSTNAME:
                displayValue = 'Translatable#First Name';
                break;
            case UserProperty.USER_LASTNAME:
                displayValue = 'Translatable#Last Name';
                break;
            case UserProperty.USER_LOGIN:
                displayValue = 'Translatable#Login';
                break;
            case UserProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case UserProperty.USER_EMAIL:
                displayValue = 'Translatable#E-Mail';
                break;
            case UserProperty.USER_PHONE:
                displayValue = 'Translatable#Phone';
                break;
            case UserProperty.USER_MOBILE:
                displayValue = 'Translatable#Mobile';
                break;
            case UserProperty.LAST_LOGIN:
                displayValue = 'Translatable#Last Login';
                break;
            case UserProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case UserProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case UserProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case UserProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case UserProperty.USER_COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case UserProperty.USER_LANGUAGE:
                displayValue = 'Translatable#Language';
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
        user: User, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = user[property];

        switch (property) {
            case UserProperty.VALID_ID:
                const objectData = ObjectDataService.getInstance().getObjectData();
                const valid = objectData.validObjects.find((v) => v.ID.toString() === user[property].toString());
                displayValue = valid ? valid.Name : user[property].toString();
                break;
            case UserProperty.CREATE_TIME:
            case UserProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case UserProperty.LAST_LOGIN:
                if (user.Preferences) {
                    const lastLogin = user.Preferences.find((p) => p.ID === UserProperty.LAST_LOGIN);
                    if (lastLogin) {
                        displayValue = await DateTimeUtil.getLocalDateTimeString(Number(lastLogin.Value) * 1000);
                    }
                }
                break;
            case UserProperty.USER_LANGUAGE:
                if (user.Preferences) {
                    const language = user.Preferences.find((p) => p.ID === UserProperty.USER_LANGUAGE);
                    if (language) {
                        displayValue = await TranslationService.getInstance().getLanguageName(language.Value);
                    }
                }
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: User, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: User): string[] {
        return [];
    }

    public async getObjectText(user: User, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        const email = user.UserEmail ? `(${user.UserEmail})` : '';
        return `${user.UserFirstname} ${user.UserLastname} ${email}`;
    }

    public getObjectAdditionalText(object: User, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: User): string | ObjectIcon {
        return 'kix-icon-man';
    }

    public getObjectTooltip(object: User, translatable: boolean = true): string {
        return '';
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Agents' : 'Translatable#Agent'
            );
        }
        return plural ? 'Agents' : 'Agent';
    }

    public async getIcons(object: User, property: string): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}

