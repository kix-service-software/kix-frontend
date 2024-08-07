/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { SysConfigService } from '../../../sysconfig/webapp/core/SysConfigService';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { OutOfOffice } from '../../model/OutOfOffice';
import { OutOfOfficeProperty } from '../../model/OutOfOfficeProperty';
import { OverlayIcon } from '../../../base-components/webapp/core/OverlayIcon';


export class UserLabelProvider extends LabelProvider<User> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.USER;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof User
            || object?.KIXObjectType === this.kixObjectType
            || object?.KIXObjectType === KIXObjectType.USER_PREFERENCE;
    }

    public isLabelProviderForType(objectType: KIXObjectType | string): boolean {
        return objectType === this.kixObjectType
            || objectType === KIXObjectType.USER_PREFERENCE;
    }

    public getSupportedProperties(): string[] {
        return [
            UserProperty.USER_ID,
            UserProperty.IS_AGENT,
            UserProperty.IS_CUSTOMER,
            UserProperty.USER_LOGIN,
            UserProperty.USER_LAST_LOGIN,
            UserProperty.USER_COMMENT,
            UserProperty.USER_ACCESS,
            UserProperty.USER_FULLNAME,
            UserProperty.USER_VALID,
            UserProperty.PREFERENCES,
            UserProperty.CONTACT,
            UserProperty.ROLE_IDS,
            UserProperty.USER_FULLNAME,
            UserProperty.USER_PASSWORD
        ];
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
            case OutOfOfficeProperty.START:
                displayValue = 'Translatable#From';
                break;
            case OutOfOfficeProperty.END:
                displayValue = 'Translatable#Till';
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
            case OutOfOfficeProperty.START:
            case OutOfOfficeProperty.END:
                displayValue = await DateTimeUtil.getLocalDateString(user[property]);
                break;
            default:
                if (this.isContactProperty(property) || property === 'ContactID') {
                    let contact = user.Contact;
                    if (!contact && user.UserID) {
                        const loadingOptions = new KIXObjectLoadingOptions();
                        loadingOptions.includes = [KIXObjectType.CONTACT];
                        const userWithContact = await KIXObjectService.loadObjects<User>(
                            KIXObjectType.USER, [user.UserID], loadingOptions, null, true
                        ).catch((): User[] => []);
                        contact = userWithContact?.length ? userWithContact[0].Contact : null;
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
        let displayValue = user?.UserLogin;

        const pattern = await SysConfigService.getInstance().getDisplayValuePattern(KIXObjectType.USER);

        if (pattern && user) {
            displayValue = await PlaceholderService.getInstance().replacePlaceholders(pattern, user);
        } else if (user.Contact) {
            const email = user.Contact ? ` (${user.Contact.Email})` : '';
            const base = user.Contact ? `${user.Contact.Firstname} ${user.Contact.Lastname}` : user.UserLogin;
            displayValue = `${base}${email}`;
        } else if (user['UserFirstname'] && user['UserLastname'] && user['UserEmail']) {
            displayValue = `${user['UserLastname']}, ${user['UserFirstname']} (${user.UserLogin})`;
        }

        return displayValue;
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

    public async getOverlayIcon(objectType: KIXObjectType, objectId: number): Promise<OverlayIcon> {
        let overlay = null;

        if (objectType === KIXObjectType.USER && !isNaN(objectId)) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, [UserProperty.PREFERENCES]
            );
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, [objectId], loadingOptions, null, true, true, true
            ).catch(() => [] as User[]);
            const user = users && users.length ? users[0] : null;

            if (user?.Preferences?.length) {
                const outOfOffice = await this.getOutOfOffice(user);
                if (outOfOffice) {
                    const title = await TranslationService.translate(
                        'Translatable#Out Of Office', undefined, undefined, false
                    );
                    overlay = new OverlayIcon(
                        undefined, title, 'object-information',
                        'fas fa-user-slash', outOfOffice, false, true
                    );
                }
            }
        }
        return overlay;
    }

    private async getOutOfOffice(object: User): Promise<OutOfOffice> {
        let outOfOffice = null;

        if (object && object?.Preferences?.length) {
            const start = object.Preferences.find((p) => p.ObjectId === UserProperty.OUT_OF_OFFICE_START);
            const end = object.Preferences.find((p) => p.ObjectId === UserProperty.OUT_OF_OFFICE_END);
            if (
                start?.Value
                && end?.Value
            ) {
                if (
                    DateTimeUtil.betweenDays(new Date(start.Value), new Date(end.Value))
                ) {
                    outOfOffice = new OutOfOffice(
                        undefined, start?.Value, end?.Value
                    );
                    return outOfOffice;
                }
            }
        }
        return outOfOffice;
    }
}
