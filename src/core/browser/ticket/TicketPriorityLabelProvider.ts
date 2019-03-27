import { ILabelProvider } from "../ILabelProvider";
import { TicketPriority, KIXObjectType, ObjectIcon, TicketPriorityProperty, DateTimeUtil, User } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";
import { KIXObjectService } from "../kix";

export class TicketPriorityLabelProvider implements ILabelProvider<TicketPriority> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    public isLabelProviderFor(ticketPriority: TicketPriority): boolean {
        return ticketPriority instanceof TicketPriority;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case TicketPriorityProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TicketPriorityProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case TicketPriorityProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case TicketPriorityProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case TicketPriorityProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case TicketPriorityProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case TicketPriorityProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case TicketPriorityProperty.ID:
                displayValue = 'Translatable#Icon';
                break;
            case 'ICON':
                displayValue = 'Translatable#Icon';
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
        ticketPriority: TicketPriority, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketPriority[property];

        switch (property) {
            case TicketPriorityProperty.ID:
            case 'ICON':
                displayValue = ticketPriority.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        switch (property) {
            case TicketPriorityProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case TicketPriorityProperty.CREATE_BY:
            case TicketPriorityProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case TicketPriorityProperty.CREATE_TIME:
            case TicketPriorityProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue.toString();
    }

    public getDisplayTextClasses(ticketPriority: TicketPriority, property: string): string[] {
        return [];
    }

    public getObjectClasses(ticketPriority: TicketPriority): string[] {
        return [];
    }

    public async getObjectText(ticketPriority: TicketPriority, id?: boolean, title?: boolean): Promise<string> {
        return ticketPriority.Name;
    }

    public getObjectAdditionalText(ticketPriority: TicketPriority): string {
        return null;
    }

    public getObjectIcon(ticketPriority?: TicketPriority): string | ObjectIcon {
        return new ObjectIcon('Priority', ticketPriority.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Priorities' : 'Translatable#Priority'
            );
        }
        return plural ? 'Priorities' : 'Priority';
    }

    public getObjectTooltip(ticketPriority: TicketPriority): string {
        return ticketPriority.Name;
    }

    public async getIcons(
        ticketPriority: TicketPriority, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketPriorityProperty.ID || property === 'ICON') {
            return [new ObjectIcon('Priority', ticketPriority.ID)];
        }
        return null;
    }

}
