import {
    Organisation, OrganisationProperty, ObjectIcon, KIXObjectType, KIXObjectProperty, User, DateTimeUtil
} from '../../model';
import { ILabelProvider } from '..';
import { SearchProperty } from '../SearchProperty';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';
import { KIXObjectService } from '../kix';

export class OrganisationLabelProvider implements ILabelProvider<Organisation> {

    public kixObjectType: KIXObjectType = KIXObjectType.ORGANISATION;

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

    public isLabelProviderFor(object: Organisation): boolean {
        return object instanceof Organisation;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case OrganisationProperty.NUMBER:
                displayValue = 'Translatable#Number';
                break;
            case OrganisationProperty.CITY:
                displayValue = 'Translatable#City';
                break;
            case OrganisationProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case OrganisationProperty.COUNTRY:
                displayValue = 'Translatable#Country';
                break;
            case OrganisationProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case OrganisationProperty.STREET:
                displayValue = 'Translatable#Street';
                break;
            case OrganisationProperty.URL:
                displayValue = 'Translatable#URL';
                break;
            case OrganisationProperty.ZIP:
                displayValue = 'Translatable#ZIP';
                break;
            case OrganisationProperty.ID:
                displayValue = 'Translatable#Organisation ID';
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
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case OrganisationProperty.OPEN_TICKETS_COUNT:
                displayValue = 'Translatable#Open Tickets';
                break;
            case OrganisationProperty.ESCALATED_TICKETS_COUNT:
                displayValue = 'Translatable#Escalated Tickets';
                break;
            case OrganisationProperty.REMINDER_TICKETS_COUNT:
                displayValue = 'Translatable#Reminder Tickets';
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
        organisation: Organisation, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = organisation[property];

        switch (property) {
            case KIXObjectProperty.VALID_ID:
                const objectData = ObjectDataService.getInstance().getObjectData();
                const valid = objectData.validObjects.find(
                    (v) => v.ID.toString() === organisation[property].toString()
                );
                displayValue = valid ? valid.Name : organisation[property].toString();
                break;
            case OrganisationProperty.OPEN_TICKETS_COUNT:
                displayValue = organisation.TicketStats.OpenCount.toString();
                break;
            case OrganisationProperty.ESCALATED_TICKETS_COUNT:
                displayValue = organisation.TicketStats.EscalatedCount.toString();
                break;
            case OrganisationProperty.REMINDER_TICKETS_COUNT:
                displayValue = organisation.TicketStats.PendingReminderCount.toString();
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: Organisation, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: Organisation): string[] {
        return [];
    }

    public async getObjectText(
        organisation: Organisation, id: boolean = false, name: boolean = false, translatable: boolean = true
    ): Promise<string> {
        let returnString = '';
        if (organisation) {
            if (id) {
                returnString = organisation.ID.toString();
            }
            if (name) {
                returnString = organisation.Name;
            }
            if (!id && !name) {
                returnString = `${organisation.Name} (${organisation.Number})`;
            }
        } else {
            const organisationLabel = await TranslationService.translate('Translatable#Organisation');
            returnString = organisationLabel;
        }
        return returnString;
    }

    public getObjectAdditionalText(object: Organisation, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: Organisation): string | ObjectIcon {
        return 'kix-icon-man-house';
    }

    public getObjectTooltip(object: Organisation, translatable: boolean = true): string {
        return '';
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        const value = plural ? 'Translatable#Organisations' : 'Translatable#Organisation';

        const organisationLabel = translatable
            ? await TranslationService.translate(value)
            : value;

        return organisationLabel;
    }

    public async getIcons(object: Organisation, property: string): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}

