/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon, Contact, ContactProperty, Organisation, KIXObjectType, KIXObjectProperty } from '../../model';
import { KIXObjectService } from '../kix';
import { SearchProperty } from '../SearchProperty';
import { TranslationService } from '../i18n/TranslationService';
import { LabelProvider } from '../LabelProvider';

export class ContactLabelProvider extends LabelProvider<Contact> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONTACT;

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                if (value) {
                    const primaryOrganisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, [value], null, null, true
                    ).catch((error) => console.log(error));
                    displayValue = primaryOrganisations && primaryOrganisations.length
                        ? `${primaryOrganisations[0].Name} (${primaryOrganisations[0].Number})`
                        : '';
                }
                break;
            case ContactProperty.ORGANISATION_IDS:
                if (value && Array.isArray(value) && value.length) {
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, value, null, null, true
                    ).catch((error) => console.log(error));
                    const organisationNames = organisations && organisations.length
                        ? organisations.map((c) => c.Name)
                        : [];
                    displayValue = organisationNames.join(', ');
                }
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: Contact): boolean {
        return object instanceof Contact;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
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
            case ContactProperty.LOGIN:
                displayValue = 'Translatable#Login Name';
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
            case ContactProperty.PASSWORD:
                displayValue = 'Translatable#Password';
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
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
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
            case ContactProperty.ORGANISATIONS:
                displayValue = await this.getPropertyValueDisplayText(
                    ContactProperty.ORGANISATION_IDS, contact.OrganisationIDs, translatable
                );
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

    public async getObjectText(
        contact: Contact, id: boolean = false, name: boolean = false, translatable: boolean = true
    ): Promise<string> {
        let returnString = '';
        if (contact) {
            if (id) {
                returnString = contact.Login;
            }
            if (name) {
                returnString = `${contact.Firstname} ${contact.Lastname}`;
            }
            if (id && name) {
                returnString = `${contact.Firstname} ${contact.Lastname} (${contact.Login})`;
            }
            if (!id && !name) {
                returnString = `${contact.Firstname} ${contact.Lastname} (${contact.Login})`;
            }
        } else {
            const contactLabel = await TranslationService.translate('Translatable#Contact');
            returnString = contactLabel;
        }
        return returnString;
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

}

