import { ObjectIcon, Contact, ContactProperty, Customer, KIXObjectType } from '../../model';
import { ILabelProvider } from '..';
import { KIXObjectService } from '../kix';
import { SearchProperty } from '../SearchProperty';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';

export class ContactLabelProvider implements ILabelProvider<Contact> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONTACT;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case ContactProperty.VALID_ID:
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

    public isLabelProviderFor(object: Contact): boolean {
        return object instanceof Contact;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case ContactProperty.ContactID:
                displayValue = 'Translatable#ID';
                break;
            case ContactProperty.USER_FIRST_NAME:
                displayValue = 'Translatable#First Name';
                break;
            case ContactProperty.USER_LAST_NAME:
                displayValue = 'Translatable#Name';
                break;
            case ContactProperty.USER_EMAIL:
                displayValue = 'Translatable#E-Mail';
                break;
            case ContactProperty.USER_LOGIN:
                displayValue = 'Translatable#Login';
                break;
            case ContactProperty.USER_CUSTOMER_IDS:
                displayValue = 'Translatable#Assigned Customers';
                break;
            case ContactProperty.USER_CUSTOMER_ID:
                displayValue = 'Translatable#Customer ID';
                break;
            case ContactProperty.USER_PHONE:
                displayValue = 'Translatable#Phone';
                break;
            case ContactProperty.USER_FAX:
                displayValue = 'Translatable#Fax';
                break;
            case ContactProperty.USER_MOBILE:
                displayValue = 'Translatable#Cell Phone';
                break;
            case ContactProperty.USER_STREET:
                displayValue = 'Translatable#Street';
                break;
            case ContactProperty.USER_CITY:
                displayValue = 'Translatable#City';
                break;
            case ContactProperty.USER_ZIP:
                displayValue = 'Translatable#ZIP';
                break;
            case ContactProperty.USER_COUNTRY:
                displayValue = 'Translatable#Country';
                break;
            case ContactProperty.USER_TITLE:
                displayValue = 'Translatable#Title';
                break;
            case ContactProperty.USER_COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case ContactProperty.USER_PASSWORD:
                displayValue = 'Translatable#Password';
                break;
            case ContactProperty.VALID_ID:
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
            case ContactProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === contact[property].toString());
                displayValue = valid ? valid.Name : contact[property].toString();
                break;
            case ContactProperty.USER_CUSTOMER_ID:
                const mainCustomers = await KIXObjectService.loadObjects<Customer>(
                    KIXObjectType.CUSTOMER, [contact.UserCustomerID], null, null, true
                ).catch((error) => console.log(error));
                displayValue = mainCustomers && mainCustomers.length
                    ? mainCustomers[0].CustomerCompanyName : contact.UserCustomerID;
                break;
            case ContactProperty.USER_CUSTOMER_IDS:
                if (contact.UserCustomerIDs && contact.UserCustomerIDs.length) {
                    const customers = await KIXObjectService.loadObjects<Customer>(
                        KIXObjectType.CUSTOMER, contact.UserCustomerIDs, null, null, true
                    ).catch((error) => console.log(error));
                    const customerNames = customers && customers.length
                        ? customers.map((c) => c.CustomerCompanyName)
                        : contact.UserCustomerIDs;
                    displayValue = customerNames.join(', ');
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
                returnString = contact.UserLogin;
            }
            if (name) {
                returnString = `${contact.UserFirstname} ${contact.UserLastname}`;
            }
            if (id && name) {
                returnString = `${contact.UserFirstname} ${contact.UserLastname} (${contact.UserLogin})`;
            }
            if (!id && !name) {
                returnString = contact.DisplayValue
                    ? contact.DisplayValue : `${contact.UserFirstname} ${contact.UserLastname} (${contact.UserLogin})`;
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

