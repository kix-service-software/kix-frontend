/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { Contact } from '../../model/Contact';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContactProperty } from '../../model/ContactProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Organisation } from '../../model/Organisation';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { UserProperty } from '../../../user/model/UserProperty';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { User } from '../../../user/model/User';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { SysConfigService } from '../../../sysconfig/webapp/core';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';

export class ContactLabelProvider extends LabelProvider<Contact> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONTACT;

    public isLabelProviderFor(object: Contact | KIXObject): boolean {
        return object instanceof Contact || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                if (value) {
                    displayValue = await KIXObjectService.loadDisplayValue(KIXObjectType.ORGANISATION, value);
                }
                break;
            case ContactProperty.PRIMARY_ORGANISATION_NUMBER:
                if (value) {
                    const primaryOrganisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, [value], null, null, true
                    ).catch((error) => console.error(error));
                    displayValue = primaryOrganisations && !!primaryOrganisations.length
                        ? primaryOrganisations[0].Number
                        : '';
                }
                break;
            case ContactProperty.ORGANISATION_IDS:
                if (value && Array.isArray(value) && value.length) {
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, value, null, null, true, true, false
                    ).catch((error) => console.error(error));
                    const organisationNames = organisations && organisations.length
                        ? organisations.map((c) => c.Name)
                        : [];
                    displayValue = organisationNames.join(', ');
                }
                break;
            default:
                if (this.isUserProperty(property)) {
                    displayValue = await LabelService.getInstance().getPropertyValueDisplayText(
                        KIXObjectType.USER, property, value, translatable
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

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ContactProperty.ID:
                displayValue = 'Translatable#ID';
                break;
            case ContactProperty.FIRSTNAME:
                displayValue = 'Translatable#First Name';
                break;
            case ContactProperty.LASTNAME:
                displayValue = 'Translatable#Last Name';
                break;
            case ContactProperty.EMAIL:
                displayValue = 'Translatable#Email';
                break;
            case ContactProperty.EMAIL1:
                displayValue = 'Translatable#Email1';
                break;
            case ContactProperty.EMAIL2:
                displayValue = 'Translatable#Email2';
                break;
            case ContactProperty.EMAIL3:
                displayValue = 'Translatable#Email3';
                break;
            case ContactProperty.EMAIL4:
                displayValue = 'Translatable#Email4';
                break;
            case ContactProperty.EMAIL5:
                displayValue = 'Translatable#Email5';
                break;
            case ContactProperty.ORGANISATION_IDS:
                displayValue = 'Translatable#Assigned Organisations';
                break;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                displayValue = 'Translatable#Organisation';
                break;
            case ContactProperty.PHONE:
                displayValue = 'Translatable#Phone';
                break;
            case ContactProperty.FAX:
                displayValue = 'Translatable#Fax';
                break;
            case ContactProperty.MOBILE:
                displayValue = 'Translatable#Mobile';
                break;
            case ContactProperty.STREET:
                displayValue = 'Translatable#Street';
                break;
            case ContactProperty.CITY:
                displayValue = 'Translatable#City';
                break;
            case ContactProperty.ZIP:
                displayValue = 'Translatable#ZIP';
                break;
            case ContactProperty.COUNTRY:
                displayValue = 'Translatable#Country';
                break;
            case ContactProperty.TITLE:
                displayValue = 'Translatable#Title';
                break;
            case ContactProperty.OPEN_TICKETS_COUNT:
                displayValue = 'Translatable#Open Tickets';
                break;
            case ContactProperty.ESCALATED_TICKETS_COUNT:
                displayValue = 'Translatable#Escalated Tickets';
                break;
            case ContactProperty.REMINDER_TICKETS_COUNT:
                displayValue = 'Translatable#Reminder Tickets';
                break;
            case ContactProperty.CREATE_NEW_TICKET:
                displayValue = 'Translatable#New Ticket';
                break;
            default:
                if (this.isUserProperty(property)) {
                    displayValue = await LabelService.getInstance().getPropertyText(
                        property, KIXObjectType.USER, short, translatable
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

    private isUserProperty(property: string): boolean {
        const userProperties = Object.keys(UserProperty).map((p) => UserProperty[p]);
        return userProperties.some((p) => p === property);
    }

    public async getExportPropertyValue(property: string, value: any, object?: any): Promise<any> {
        let newValue = value;
        switch (property) {
            case ContactProperty.PRIMARY_ORGANISATION_NUMBER:
                if (object) {
                    const orgId = object[ContactProperty.PRIMARY_ORGANISATION_ID];
                    if (orgId) {
                        const primaryOrganisations = await KIXObjectService.loadObjects<Organisation>(
                            KIXObjectType.ORGANISATION, [orgId], null, null, true
                        ).catch((error) => console.error(error));
                        newValue = primaryOrganisations && !!primaryOrganisations.length
                            ? primaryOrganisations[0].Number
                            : orgId;
                    }
                }
                break;
            default:
                newValue = await super.getExportPropertyValue(property, value, object);
        }
        return newValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        if (property === ContactProperty.CREATE_NEW_TICKET) {
            return 'kix-icon-new-ticket';
        }
        return undefined;
    }

    public async getDisplayText(
        contact: Contact, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof defaultValue !== 'undefined' && defaultValue !== null
            ? defaultValue : contact[property];

        switch (property) {
            case ContactProperty.FIRSTNAME:
            case ContactProperty.LASTNAME:
            case ContactProperty.STREET:
            case ContactProperty.ZIP:
            case ContactProperty.CITY:
            case ContactProperty.COUNTRY:
            case ContactProperty.MOBILE:
            case ContactProperty.TITLE:
                translatable = false;
                break;
            case ContactProperty.CREATE_NEW_TICKET:
                if (contact.ValidID === 1) {
                    const newTicketLabel = await TranslationService.translate('Translatable#New Ticket');
                    displayValue = newTicketLabel;
                }
                break;
            case ContactProperty.OPEN_TICKETS_COUNT:
                if (contact.TicketStats) {
                    displayValue = contact.TicketStats.OpenCount.toString();
                }
                break;
            case ContactProperty.ESCALATED_TICKETS_COUNT:
                if (contact.TicketStats) {
                    displayValue = contact.TicketStats.EscalatedCount.toString();
                }
                break;
            case ContactProperty.REMINDER_TICKETS_COUNT:
                if (contact.TicketStats) {
                    displayValue = contact.TicketStats.PendingReminderCount.toString();
                }
                break;
            case ContactProperty.VALID:
                displayValue = await this.getPropertyValueDisplayText(
                    KIXObjectProperty.VALID_ID, contact.ValidID, translatable
                );
                break;
            case ContactProperty.PRIMARY_ORGANISATION:
                displayValue = await this.getPropertyValueDisplayText(
                    ContactProperty.PRIMARY_ORGANISATION_ID, contact.PrimaryOrganisationID, translatable
                );
                break;
            case ContactProperty.PRIMARY_ORGANISATION_NUMBER:
                displayValue = await this.getPropertyValueDisplayText(
                    ContactProperty.PRIMARY_ORGANISATION_NUMBER, contact.PrimaryOrganisationID, translatable
                );
                break;
            case ContactProperty.ORGANISATIONS:
                displayValue = await this.getPropertyValueDisplayText(
                    ContactProperty.ORGANISATION_IDS, contact.OrganisationIDs, translatable
                );
                break;
            default:
                if (this.isUserProperty(property)) {
                    const user = await this.getUserByContact(
                        contact, property !== PersonalSettingsProperty.USER_LANGUAGE
                    );
                    if (user) {
                        displayValue = await LabelService.getInstance().getDisplayText(
                            user, property, defaultValue, translatable
                        );
                    }
                } else {
                    displayValue = await super.getDisplayText(contact, property, defaultValue, translatable);
                }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(
        contact: Contact, id: boolean = false, name: boolean = false, translatable: boolean = true
    ): Promise<string> {
        let displayValue = '';
        if (contact) {
            const pattern = await SysConfigService.getInstance().getDisplayValuePattern(KIXObjectType.CONTACT);

            if (pattern) {
                displayValue = await PlaceholderService.getInstance().replacePlaceholders(pattern, contact);
            } else {
                const user = await this.getUserByContact(contact);
                const idString = user ? user.UserLogin : contact.Email;
                if (id) {
                    displayValue = idString;
                }
                if (name) {
                    displayValue = `${contact.Firstname} ${contact.Lastname}`;
                }
                if (id && name) {
                    displayValue = `${contact.Firstname} ${contact.Lastname} (${idString})`;
                }
                if (!id && !name) {
                    displayValue = `${contact.Firstname} ${contact.Lastname} (${idString})`;
                }
            }
        } else {
            const contactLabel = await TranslationService.translate('Translatable#Contact');
            displayValue = contactLabel;
        }
        return displayValue;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-man-bubble';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (plural) {
            const contactsLabel = translatable
                ? await TranslationService.translate('Translatable#Contacts')
                : 'Contacts';
            return contactsLabel;
        }

        const contactLabel = translatable ? await TranslationService.translate('Translatable#Contact') : 'Contact';
        return contactLabel;
    }

    public async getIcons(
        contact: Contact, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {

        let icons = [];

        switch (property) {
            default:
                if (this.isUserProperty(property)) {
                    const user = await this.getUserByContact(contact);
                    if (user) {
                        icons = await LabelService.getInstance().getIcons(
                            user, property, value
                        );
                    }
                }
        }

        return icons;
    }

    private async getUserByContact(contact: Contact, useInclude: boolean = true): Promise<User> {
        let user;
        if (contact) {
            if (useInclude && contact.User) {
                user = contact.User;
            } else if (contact.AssignedUserID) {
                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, [UserProperty.PREFERENCES]);
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [contact.AssignedUserID], loadingOptions, null, true, true, true
                ).catch(() => [] as User[]);
                user = users && users.length ? users[0] : null;
            }
        }
        return user;
    }

    public getObjectIcon(object?: Contact): string | ObjectIcon {
        if (object) {
            return new ObjectIcon(null, KIXObjectType.CONTACT, object.ID, null, null, 'kix-icon-man-bubble');
        } else {
            return 'kix-icon-man-bubble';
        }
    }
}

