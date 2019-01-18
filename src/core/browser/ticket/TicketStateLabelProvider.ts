import { ILabelProvider } from "../ILabelProvider";
import { TicketState, KIXObjectType, ObjectIcon, TicketStateProperty, DateTimeUtil } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { ContextService } from "../context";

export class TicketStateLabelProvider implements ILabelProvider<TicketState> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    public isLabelProviderFor(ticketState: TicketState): boolean {
        return ticketState instanceof TicketState;
    }

    public async getPropertyText(property: string, ticketState?: TicketState, short?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Volltext';
                break;
            case TicketStateProperty.NAME:
                displayValue = 'Name';
                break;
            case TicketStateProperty.COMMENT:
                displayValue = 'Kommentar';
                break;
            case TicketStateProperty.TYPE_NAME:
            case TicketStateProperty.TYPE_ID:
                displayValue = 'Statustyp';
                break;
            case TicketStateProperty.CREATED_BY:
                displayValue = 'Erstellt von';
                break;
            case TicketStateProperty.CREATE_TIME:
                displayValue = 'Erstellt am';
                break;
            case TicketStateProperty.CHANGE_BY:
                displayValue = 'Geändert von';
                break;
            case TicketStateProperty.CHANGE_TIME:
                displayValue = 'Geändert am';
                break;
            case TicketStateProperty.VALID_ID:
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

    public getDisplayText(ticketState: TicketState, property: string): Promise<string> {
        let displayValue = ticketState[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case TicketStateProperty.TYPE_ID:
                displayValue = ticketState.TypeName;
                break;
            case TicketStateProperty.CREATED_BY:
            case TicketStateProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case TicketStateProperty.CREATE_TIME:
            case TicketStateProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketStateProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID === displayValue);
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case 'ICON':
                displayValue = ticketState.Name;
                break;
            default:
        }
        return displayValue;
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(ticketState: TicketState, property: string): string[] {
        return [];
    }

    public getObjectClasses(ticketState: TicketState): string[] {
        return [];
    }

    public async getObjectText(ticketState: TicketState, id?: boolean, title?: boolean): Promise<string> {
        return 'Status: ' + ticketState.Name;
    }

    public getObjectAdditionalText(ticketState: TicketState): string {
        return null;
    }

    public getObjectIcon(ticketState?: TicketState): string | ObjectIcon {
        return new ObjectIcon('TicketState', ticketState.ID);
    }

    public getObjectName(plural?: boolean): string {
        return 'Status';
    }

    public getObjectTooltip(ticketState: TicketState): string {
        return ticketState.Name;
    }

    public async getIcons(
        ticketState: TicketState, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === 'ICON') {
            return [new ObjectIcon('TicketState', ticketState.ID)];
        }
        return null;
    }

}
