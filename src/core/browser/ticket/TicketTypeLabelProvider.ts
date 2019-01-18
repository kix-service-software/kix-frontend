import { ILabelProvider } from "../ILabelProvider";
import { TicketType, KIXObjectType, ObjectIcon, TicketTypeProperty, DateTimeUtil } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { ContextService } from "../context";

export class TicketTypeLabelProvider implements ILabelProvider<TicketType> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

    public isLabelProviderFor(ticketType: TicketType): boolean {
        return ticketType instanceof TicketType;
    }

    public async getPropertyText(property: string, ticketType?: TicketType, short?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Volltext';
                break;
            case TicketTypeProperty.NAME:
                displayValue = 'Name';
                break;
            case TicketTypeProperty.COMMENT:
                displayValue = 'Kommentar';
                break;
            case TicketTypeProperty.CREATE_BY:
                displayValue = 'Erstellt von';
                break;
            case TicketTypeProperty.CREATE_TIME:
                displayValue = 'Erstellt am';
                break;
            case TicketTypeProperty.CHANGE_BY:
                displayValue = 'Geändert von';
                break;
            case TicketTypeProperty.CHANGE_TIME:
                displayValue = 'Geändert am';
                break;
            case TicketTypeProperty.VALID_ID:
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

    public getDisplayText(ticketType: TicketType, property: string): Promise<string> {
        let displayValue = ticketType[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case TicketTypeProperty.CREATE_BY:
            case TicketTypeProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case TicketTypeProperty.CREATE_TIME:
            case TicketTypeProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketTypeProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID === displayValue);
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case 'ICON':
                displayValue = ticketType.Name;
                break;
            default:
        }
        return displayValue;
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(ticketType: TicketType, property: string): string[] {
        return [];
    }

    public getObjectClasses(ticketType: TicketType): string[] {
        return [];
    }

    public async getObjectText(ticketType: TicketType, id?: boolean, title?: boolean): Promise<string> {
        return 'Typ: ' + ticketType.Name;
    }

    public getObjectAdditionalText(ticketType: TicketType): string {
        return null;
    }

    public getObjectIcon(ticketType?: TicketType): string | ObjectIcon {
        return new ObjectIcon('TicketType', ticketType.ID);
    }

    public getObjectName(plural?: boolean): string {
        return plural ? 'Typen' : 'Typ';
    }

    public getObjectTooltip(ticketType: TicketType): string {
        return ticketType.Name;
    }

    public async getIcons(
        ticketType: TicketType, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === 'ICON') {
            return [new ObjectIcon('TicketType', ticketType.ID)];
        }
        return null;
    }

}
