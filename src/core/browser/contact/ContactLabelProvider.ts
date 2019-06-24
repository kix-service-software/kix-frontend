import {
    ObjectIcon, Contact, ContactProperty, Organisation, KIXObjectType, KIXObjectProperty, DateTimeUtil, User
} from '../../model';
import { ILabelProvider } from '..';
import { KIXObjectService } from '../kix';
import { SearchProperty } from '../SearchProperty';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';

export class ContactLabelProvider implements ILabelProvider<Contact> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONTACT;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case KIXObjectProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                case KIXObjectProperty.CREATE_BY:
                case KIXObjectProperty.CHANGE_BY:
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value], null, null, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && !!users.length ? users[0].UserFullname : value;
                    break;
                case KIXObjectProperty.CREATE_TIME:
                case KIXObjectProperty.CHANGE_TIME:
                    displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                    break;
                default:
            }
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: Contact): boolean {
        return object instanceof Contact;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case ContactProperty.ID:
                displayValue = 'Translatable#ID';
                break;
            case ContactProperty.FIRST_NAME:
                displayValue = 'Translatable#First Name';
                break;
            case ContactProperty.LAST_NAME:
                displayValue = 'Translatable#Name';
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
            case ContactProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case ContactProperty.PASSWORD:
                displayValue = 'Translatable#Password';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
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
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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
        let displayValue = contact[property];

        const objectData = ObjectDataService.getInstance().getObjectData();

        switch (property) {
            case KIXObjectProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === contact[property].toString());
                displayValue = valid ? valid.Name : contact[property].toString();
                break;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                const primaryOrganisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, [contact.PrimaryOrganisationID], null, null, true
                ).catch((error) => console.log(error));
                displayValue = primaryOrganisations && primaryOrganisations.length
                    ? `${primaryOrganisations[0].Name} (${primaryOrganisations[0].Number})`
                    : contact.PrimaryOrganisationID;
                break;
            case ContactProperty.ORGANISATION_IDS:
                if (contact.OrganisationIDs && contact.OrganisationIDs.length) {
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, contact.OrganisationIDs, null, null, true
                    ).catch((error) => console.log(error));
                    const organisationNames = organisations && organisations.length
                        ? organisations.map((c) => c.Name)
                        : contact.OrganisationIDs;
                    displayValue = organisationNames.join(', ');
                }
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
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: Contact, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: Contact): string[] {
        return [];
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

    public getObjectAdditionalText(object: Contact, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: Contact): string | ObjectIcon {
        return 'kix-icon-man-bubble';
    }

    public getObjectTooltip(object: Contact): string {
        return '';
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

    public async getIcons(object: Contact, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        return icons;
    }

}

