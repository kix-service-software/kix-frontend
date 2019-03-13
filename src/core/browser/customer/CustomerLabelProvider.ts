import { Customer, CustomerProperty, ObjectIcon, KIXObjectType } from '../../model';
import { ILabelProvider } from '..';
import { SearchProperty } from '../SearchProperty';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';

export class CustomerLabelProvider implements ILabelProvider<Customer> {

    public kixObjectType: KIXObjectType = KIXObjectType.CUSTOMER;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case CustomerProperty.VALID_ID:
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

    public isLabelProviderFor(object: Customer): boolean {
        return object instanceof Customer;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_CITY:
                displayValue = 'Translatable#City';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_COUNTRY:
                displayValue = 'Translatable#Country';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_NAME:
                displayValue = 'Translatable#Name';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_STREET:
                displayValue = 'Translatable#Street';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_URL:
                displayValue = 'Translatable#URL';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_ZIP:
                displayValue = 'Translatable#PLZ';
                break;
            case CustomerProperty.CUSTOMER_ID:
                displayValue = 'Translatable#Customer ID';
                break;
            case CustomerProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case CustomerProperty.OPEN_TICKETS_COUNT:
                displayValue = 'Translatable#Open Tickets';
                break;
            case CustomerProperty.ESCALATED_TICKETS_COUNT:
                displayValue = 'Translatable#Escalated Tickets';
                break;
            case CustomerProperty.REMINDER_TICKETS_COUNT:
                displayValue = 'Translatable#Reminder Tickets';
                break;
            case 'customer-new-ticket':
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
        return;
    }

    public async getDisplayText(
        customer: Customer, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = customer[property];

        switch (property) {
            case CustomerProperty.VALID_ID:
                const objectData = ObjectDataService.getInstance().getObjectData();
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

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: Customer, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: Customer): string[] {
        return [];
    }

    public async getObjectText(
        customer: Customer, id: boolean = false, name: boolean = false, translatable: boolean = true
    ): Promise<string> {
        let returnString = '';
        if (customer) {
            if (id) {
                returnString = customer.CustomerID;
            }
            if (name) {
                returnString = customer.CustomerCompanyName;
            }
            if (!id && !name) {
                returnString = customer.DisplayValue
                    ? customer.DisplayValue : `${customer.CustomerCompanyName} (${customer.CustomerID})`;
            }
        } else {
            const customerLabel = await TranslationService.translate('Translatable#Customer');
            returnString = customerLabel;
        }
        return returnString;
    }

    public getObjectAdditionalText(object: Customer, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: Customer): string | ObjectIcon {
        return 'kix-icon-man-house';
    }

    public getObjectTooltip(object: Customer, translatable: boolean = true): string {
        return '';
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (plural) {
            const customersLabel = translatable
                ? await TranslationService.translate('Translatable#Customers')
                : 'Customers';
            return customersLabel;
        }

        const customerLabel = translatable ? await TranslationService.translate('Translatable#Customer') : 'Customer';
        return customerLabel;
    }

    public async getIcons(object: Customer, property: string): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}

