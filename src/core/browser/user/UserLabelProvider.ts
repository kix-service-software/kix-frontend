import {
    User, KIXObjectType, UserProperty, ObjectIcon, DateTimeUtil, ValidObject,
    KIXObjectProperty, PersonalSettingsProperty
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";
import { LabelProvider } from "../LabelProvider";


export class UserLabelProvider extends LabelProvider<User> {

    public kixObjectType: KIXObjectType = KIXObjectType.USER;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;

        switch (property) {
            case KIXObjectProperty.CREATE_TIME:
            case KIXObjectProperty.CHANGE_TIME:
                if (value) {
                    displayValue = translatable ?
                        await DateTimeUtil.getLocalDateTimeString(displayValue) : displayValue;
                }
                break;
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                if (value) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value], null, null, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && !!users.length ? users[0].UserFullname : value;
                }
                break;
            case KIXObjectProperty.VALID_ID:
                if (value) {
                    const validObjects = await KIXObjectService.loadObjects<ValidObject>(
                        KIXObjectType.VALID_OBJECT, [value], null, null, true
                    ).catch((error) => [] as ValidObject[]);
                    displayValue = validObjects && !!validObjects.length ? validObjects[0].Name : value;
                }
                break;
            default:
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
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
                displayValue = 'Translatable#Login Name';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case UserProperty.USER_EMAIL:
                displayValue = 'Translatable#Email';
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
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case KIXObjectProperty.CHANGE_TIME:
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

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        user: User, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = user[property];

        switch (property) {
            case UserProperty.LAST_LOGIN:
                if (user.Preferences) {
                    const lastLogin = user.Preferences.find((p) => p.ID === UserProperty.LAST_LOGIN);
                    if (lastLogin) {
                        displayValue = translatable
                            ? await DateTimeUtil.getLocalDateTimeString(Number(lastLogin.Value) * 1000)
                            : Number(lastLogin.Value) * 1000;
                    }
                }
                break;
            case PersonalSettingsProperty.USER_LANGUAGE:
                if (user.Preferences) {
                    const language = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.USER_LANGUAGE);
                    if (language) {
                        displayValue = await TranslationService.getInstance().getLanguageName(language.Value);
                    }
                }
                break;
            case UserProperty.USER_VALID:
                displayValue = await this.getPropertyValueDisplayText(
                    KIXObjectProperty.VALID_ID, user.ValidID, translatable
                );
                break;
            case PersonalSettingsProperty.USER_LANGUAGE:
                if (user.Preferences) {
                    const language = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.USER_LANGUAGE);
                    if (language) {
                        displayValue = await TranslationService.getInstance().getLanguageName(language.Value);
                    }
                }
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(user: User, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        const email = user.UserEmail ? `(${user.UserEmail})` : '';
        return `${user.UserFirstname} ${user.UserLastname} ${email}`;
    }

    public getObjectIcon(object: User): string | ObjectIcon {
        return 'kix-icon-man';
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Agents' : 'Translatable#Agent'
            );
        }
        return plural ? 'Agents' : 'Agent';
    }

}
