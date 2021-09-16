/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { User } from '../../model/User';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { UserProperty } from '../../model/UserProperty';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { PersonalSettingsProperty } from '../../model/PersonalSettingsProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ContactProperty } from '../../../customer/model/ContactProperty';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { Contact } from '../../../customer/model/Contact';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObject } from '../../../../model/kix/KIXObject';


export class UserLabelProvider extends LabelProvider<User> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.USER;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof User || object.KIXObjectType === KIXObjectType.USER;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case UserProperty.USER_LOGIN:
                displayValue = 'Translatable#Login Name';
                break;
            case UserProperty.USER_LAST_LOGIN:
                displayValue = 'Translatable#Last Login';
                break;
            case UserProperty.USER_COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case PersonalSettingsProperty.USER_LANGUAGE:
                displayValue = 'Translatable#Language';
                break;
            case PersonalSettingsProperty.MY_QUEUES:
                displayValue = 'Translatable#My Queues';
                break;
            case PersonalSettingsProperty.NOTIFICATIONS:
                displayValue = 'Translatable#Ticket Notifications';
                break;
            case UserProperty.USER_ACCESS:
                displayValue = 'Translatable#Access';
                break;
            case UserProperty.IS_AGENT:
                displayValue = 'Translatable#Agent Login';
                break;
            case UserProperty.IS_CUSTOMER:
                displayValue = 'Translatable#Customer Login';
                break;
            default:
                if (this.isContactProperty(property)) {
                    displayValue = await LabelService.getInstance().getPropertyText(
                        property, KIXObjectType.CONTACT, short, translatable
                    );
                } else {
                    displayValue = await super.getPropertyText(property, short, translatable);
                }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case UserProperty.IS_AGENT:
            case UserProperty.IS_CUSTOMER:
                displayValue = typeof displayValue !== 'undefined' && displayValue !== null
                    ? displayValue ? 'Translatable#Yes' : 'Translatable#No'
                    : '';
                break;
            default:
                if (this.isContactProperty(property)) {
                    displayValue = await LabelService.getInstance().getPropertyText(
                        property, KIXObjectType.CONTACT, value, translatable
                    );
                } else {
                    displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
                }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getDisplayText(
        user: User, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = user[property];

        switch (property) {
            case UserProperty.USER_LOGIN:
            case UserProperty.USER_COMMENT:
                translatable = false;
                break;
            case UserProperty.USER_LAST_LOGIN:
                if (user.Preferences) {
                    const lastLogin = user.Preferences.find((p) => p.ID === UserProperty.USER_LAST_LOGIN);
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
            case UserProperty.USER_ACCESS:
                const userIsA = [];
                if (user.IsAgent) {
                    userIsA.push(
                        await TranslationService.translate(
                            'Translatable#Agent Portal', undefined, undefined, !translatable
                        )
                    );
                }
                if (user.IsCustomer) {
                    userIsA.push(
                        await TranslationService.translate(
                            'Translatable#Customer Portal', undefined, undefined, !translatable
                        )
                    );
                }
                displayValue = userIsA.join(', ');
                translatable = false;
                break;
            default:
                if (this.isContactProperty(property) || property === 'ContactID') {
                    let contact = user.Contact;
                    if (!contact) {
                        const contacts = await KIXObjectService.loadObjects<Contact>(
                            KIXObjectType.CONTACT, null,
                            new KIXObjectLoadingOptions(
                                [
                                    new FilterCriteria(
                                        ContactProperty.ASSIGNED_USER_ID, SearchOperator.EQUALS,
                                        FilterDataType.NUMERIC, FilterType.AND, user.UserID
                                    )
                                ]
                            ), null, true
                        ).catch(() => [] as Contact[]);
                        contact = contacts && contacts.length ? contacts[0] : null;
                    }
                    if (contact) {
                        if (property === 'ContactID') {
                            displayValue = contact.ID;
                            translatable = false;
                        } else {
                            displayValue = await LabelService.getInstance().getDisplayText(
                                contact, property, defaultValue, translatable
                            );
                        }
                    }

                    translatable = false;
                } else {
                    displayValue = await super.getDisplayText(user, property, defaultValue, translatable);
                }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    private isContactProperty(property: string): boolean {
        const contactProperties = Object.keys(ContactProperty).map((p) => ContactProperty[p]);
        return contactProperties.some((p) => p === property);
    }

    public async getObjectText(user: User, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        if (user.Contact) {
            const email = user.Contact ? ` (${user.Contact.Email})` : '';
            const base = user.Contact ? `${user.Contact.Firstname} ${user.Contact.Lastname}` : user.UserLogin;
            return `${base}${email}`;
        } else if (user['UserFirstname'] && user['UserLastname'] && user['UserEmail']) {
            return `${user['UserLastname']}, ${user['UserFirstname']} (${user.UserLogin})`;
        }

        return user.UserLogin;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-man';
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Users' : 'Translatable#User'
            );
        }
        return plural ? 'Users' : 'User';
    }

    public getObjectIcon(object: User): string | ObjectIcon {
        return new ObjectIcon(null, KIXObjectType.CONTACT, object.Contact?.ID, null, null, 'fas fa-user');
    }

    public async getIcons(
        user: User, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {

        const icons = [];

        switch (property) {
            case UserProperty.IS_AGENT:
            case UserProperty.IS_CUSTOMER:
                if (user && Boolean(user[property])) {
                    icons.push('kix-icon-check');
                }
                break;
            default:
        }

        return icons;
    }

}
