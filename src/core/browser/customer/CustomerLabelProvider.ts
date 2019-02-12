import { Customer, CustomerProperty, ObjectIcon, KIXObjectType, KIXObject } from "../../model";
import { ILabelProvider, ContextService } from "..";
import { SearchProperty } from "../SearchProperty";

export class CustomerLabelProvider implements ILabelProvider<Customer> {

    public kixObjectType: KIXObjectType = KIXObjectType.CUSTOMER;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        let displayValue = value;
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case CustomerProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                default:
            }
        }
        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: Customer): boolean {
        return object instanceof Customer;
    }

    public async getPropertyText(property: string, object?: KIXObject): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Volltext';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_City:
                displayValue = "Stadt";
                break;
            case CustomerProperty.CUSTOMER_COMPANY_COMMENT:
                displayValue = "Kommentar";
                break;
            case CustomerProperty.CUSTOMER_COMPANY_COUNTRY:
                displayValue = "Land";
                break;
            case CustomerProperty.CUSTOMER_COMPANY_NAME:
                displayValue = "Name";
                break;
            case CustomerProperty.CUSTOMER_COMPANY_STREET:
                displayValue = "Straße";
                break;
            case CustomerProperty.CUSTOMER_COMPANY_URL:
                displayValue = "URL";
                break;
            case CustomerProperty.CUSTOMER_COMPANY_ZIP:
                displayValue = "PLZ";
                break;
            case CustomerProperty.CUSTOMER_ID:
                displayValue = "Kunden ID";
                break;
            case CustomerProperty.VALID_ID:
                displayValue = "Gültigkeit";
                break;
            case CustomerProperty.OPEN_TICKETS_COUNT:
                displayValue = "Offene Tickets";
                break;
            case CustomerProperty.ESCALATED_TICKETS_COUNT:
                displayValue = "Eskalierte Tickets";
                break;
            case CustomerProperty.REMINDER_TICKETS_COUNT:
                displayValue = "Erinnerungstickets";
                break;
            case 'customer-new-ticket':
                displayValue = "";
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getDisplayText(customer: Customer, property: string): Promise<string> {
        let displayValue = customer[property];

        switch (property) {
            case CustomerProperty.VALID_ID:
                const objectData = ContextService.getInstance().getObjectData();
                const valid = objectData.validObjects.find((v) => v.ID.toString() === customer[property].toString());
                displayValue = valid ? valid.Name : customer[property].toString();
                break;
            case CustomerProperty.OPEN_TICKETS_COUNT:
                displayValue = customer.TicketStats.OpenCount.toString();
                break;
            case CustomerProperty.ESCALATED_TICKETS_COUNT:
                displayValue = customer.TicketStats.EscalatedCount.toString();
                break;
            case CustomerProperty.REMINDER_TICKETS_COUNT:
                displayValue = customer.TicketStats.PendingReminderCount.toString();
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: Customer, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: Customer): string[] {
        return [];
    }

    public async getObjectText(customer: Customer, id: boolean = false, name: boolean = false): Promise<string> {
        let returnString = '';
        if (customer) {
            if (id) {
                returnString = customer.CustomerID;
            }
            if (name) {
                returnString = customer.CustomerCompanyName;
            }
            if (!id && !name) {
                returnString = customer.DisplayValue;
            }
        } else {
            returnString = 'Kunde';
        }
        return returnString;
    }

    public getObjectAdditionalText(object: Customer): string {
        return '';
    }

    public getObjectIcon(object: Customer): string | ObjectIcon {
        return 'kix-icon-man-house';
    }

    public getObjectTooltip(object: Customer): string {
        return '';
    }

    public getObjectName(plural: boolean = false): string {
        return plural ? "Kunden" : "Kunde";
    }

    public async getIcons(object: Customer, property: string): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}

