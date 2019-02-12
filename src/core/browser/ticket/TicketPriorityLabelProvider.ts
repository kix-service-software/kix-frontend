import { ILabelProvider } from "../ILabelProvider";
import { TicketPriority, KIXObjectType, ObjectIcon, TicketPriorityProperty, DateTimeUtil } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { ContextService } from "../context";

export class TicketPriorityLabelProvider implements ILabelProvider<TicketPriority> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    public isLabelProviderFor(ticketPriority: TicketPriority): boolean {
        return ticketPriority instanceof TicketPriority;
    }

    public async getPropertyText(property: string, ticketPriority?: TicketPriority, short?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Volltext';
                break;
            case TicketPriorityProperty.NAME:
                displayValue = 'Name';
                break;
            case TicketPriorityProperty.COMMENT:
                displayValue = 'Kommentar';
                break;
            case TicketPriorityProperty.CREATE_BY:
                displayValue = 'Erstellt von';
                break;
            case TicketPriorityProperty.CREATE_TIME:
                displayValue = 'Erstellt am';
                break;
            case TicketPriorityProperty.CHANGE_BY:
                displayValue = 'Geändert von';
                break;
            case TicketPriorityProperty.CHANGE_TIME:
                displayValue = 'Geändert am';
                break;
            case TicketPriorityProperty.VALID_ID:
                displayValue = 'Gültigkeit';
                break;
            case 'ICON':
                displayValue = 'Icon';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public getDisplayText(ticketPriority: TicketPriority, property: string): Promise<string> {
        let displayValue = ticketPriority[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case TicketPriorityProperty.CREATE_BY:
            case TicketPriorityProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case TicketPriorityProperty.CREATE_TIME:
            case TicketPriorityProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketPriorityProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID === displayValue);
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            default:
        }
        return displayValue;
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(ticketPriority: TicketPriority, property: string): string[] {
        return [];
    }

    public getObjectClasses(ticketPriority: TicketPriority): string[] {
        return [];
    }

    public async getObjectText(ticketPriority: TicketPriority, id?: boolean, title?: boolean): Promise<string> {
        return 'Priorität: ' + ticketPriority.Name;
    }

    public getObjectAdditionalText(ticketPriority: TicketPriority): string {
        return null;
    }

    public getObjectIcon(ticketPriority?: TicketPriority): string | ObjectIcon {
        return new ObjectIcon('Priority', ticketPriority.ID);
    }

    public getObjectName(plural?: boolean): string {
        return plural ? 'Prioritäten' : 'Priorität';
    }

    public getObjectTooltip(ticketPriority: TicketPriority): string {
        return ticketPriority.Name;
    }

    public async getIcons(
        ticketPriority: TicketPriority, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === 'ICON') {
            return [new ObjectIcon('Priority', ticketPriority.ID)];
        }
        return null;
    }

}
