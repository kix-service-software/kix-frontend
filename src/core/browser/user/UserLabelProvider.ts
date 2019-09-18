/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    User, KIXObjectType, UserProperty, ObjectIcon, DateTimeUtil, KIXObjectProperty, PersonalSettingsProperty
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";


export class UserLabelProvider extends LabelProvider<User> {

    public kixObjectType: KIXObjectType = KIXObjectType.USER;

    public isLabelProviderFor(object: User): boolean {
        return object instanceof User;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
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
            case UserProperty.USER_COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case UserProperty.USER_LANGUAGE:
                displayValue = 'Translatable#Language';
                break;
            case UserProperty.MY_QUEUES:
                displayValue = 'Translatable#My Queues';
                break;
            case UserProperty.NOTIFICATIONS:
                displayValue = 'Translatable#Ticket Notifications';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
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

    public getObjectTypeIcon(): string | ObjectIcon {
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
