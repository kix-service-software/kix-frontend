import { ObjectIcon, Contact, ContactProperty, Customer, KIXObjectType, KIXObject } from "../../model";
import { ILabelProvider, ContextService } from "..";
import { KIXObjectService } from "../kix";
import { SearchProperty } from "../SearchProperty";

export class ContactLabelProvider implements ILabelProvider<Contact> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONTACT;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        let displayValue = value;
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case ContactProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                default:
            }
        }
        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: Contact): boolean {
        return object instanceof Contact;
    }

    public async getPropertyText(property: string, object?: KIXObject): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Volltext';
                break;
            case ContactProperty.ContactID:
                displayValue = "ID";
                break;
            case ContactProperty.USER_FIRST_NAME:
                displayValue = "Vorname";
                break;
            case ContactProperty.USER_LAST_NAME:
                displayValue = "Name";
                break;
            case ContactProperty.USER_EMAIL:
                displayValue = "E-Mail";
                break;
            case ContactProperty.USER_LOGIN:
                displayValue = "Login";
                break;
            case ContactProperty.USER_CUSTOMER_IDS:
                displayValue = "Zugeordnete Kunden";
                break;
            case ContactProperty.USER_CUSTOMER_ID:
                displayValue = "Kunden ID";
                break;
            case ContactProperty.USER_PHONE:
                displayValue = "Telefon";
                break;
            case ContactProperty.USER_FAX:
                displayValue = "Fax";
                break;
            case ContactProperty.USER_MOBILE:
                displayValue = "Mobil";
                break;
            case ContactProperty.USER_STREET:
                displayValue = "Straße";
                break;
            case ContactProperty.USER_CITY:
                displayValue = "Stadt";
                break;
            case ContactProperty.USER_ZIP:
                displayValue = "PLZ";
                break;
            case ContactProperty.USER_COUNTRY:
                displayValue = "Land";
                break;
            case ContactProperty.USER_TITLE:
                displayValue = "Titel";
                break;
            case ContactProperty.USER_COMMENT:
                displayValue = "Kommentar";
                break;
            case ContactProperty.USER_PASSWORD:
                displayValue = "Passwort";
                break;
            case ContactProperty.VALID_ID:
                displayValue = "Gültigkeit";
                break;
            case ContactProperty.OPEN_TICKETS_COUNT:
                displayValue = "Offene Tickets";
                break;
            case ContactProperty.ESCALATED_TICKETS_COUNT:
                displayValue = "Eskalierte Tickets";
                break;
            case ContactProperty.REMINDER_TICKETS_COUNT:
                displayValue = "Erinnerungstickets";
                break;
            case 'contact-new-ticket':
                displayValue = "";
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getDisplayText(contact: Contact, property: string): Promise<string> {
        let displayValue = contact[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case ContactProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === contact[property].toString());
                displayValue = valid ? valid.Name : contact[property].toString();
                break;
            case ContactProperty.USER_CUSTOMER_ID:
                const mainCustomers = await KIXObjectService.loadObjects<Customer>(
                    KIXObjectType.CUSTOMER, [contact.UserCustomerID]
                ).catch((error) => console.log(error));
                displayValue = mainCustomers && mainCustomers.length
                    ? mainCustomers[0].CustomerCompanyName : contact.UserCustomerID;
                break;
            case ContactProperty.USER_CUSTOMER_IDS:
                if (contact.UserCustomerIDs && contact.UserCustomerIDs.length) {
                    const customers = await KIXObjectService.loadObjects<Customer>(
                        KIXObjectType.CUSTOMER, contact.UserCustomerIDs
                    ).catch((error) => console.log(error));
                    const customerNames = customers && customers.length
                        ? customers.map((c) => c.CustomerCompanyName)
                        : contact.UserCustomerIDs;
                    displayValue = customerNames.join(', ');
                }
                break;
            case 'contact-new-ticket':
                if (contact.ValidID === 1) {
                    displayValue = "Neues Ticket";
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

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: Contact, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: Contact): string[] {
        return [];
    }

    public async getObjectText(contact: Contact, id: boolean = false, name: boolean = false): Promise<string> {
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
                returnString = contact.DisplayValue;
            }
        } else {
            returnString = 'Ansprechpartner';
        }
        return returnString;
    }

    public getObjectAdditionalText(object: Contact): string {
        return '';
    }

    public getObjectIcon(object: Contact): string | ObjectIcon {
        return 'kix-icon-man-bubble';
    }

    public getObjectTooltip(object: Contact): string {
        return '';
    }

    public getObjectName(): string {
        return "Ansprechpartner";
    }

    public async getIcons(object: Contact, property: string): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}

