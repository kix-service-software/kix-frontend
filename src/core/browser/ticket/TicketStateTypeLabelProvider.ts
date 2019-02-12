import { ILabelProvider } from "../ILabelProvider";
import { KIXObjectType, ObjectIcon, TicketStateProperty, DateTimeUtil, TicketStateType } from "../../model";
import { ContextService } from "../context";

export class TicketStateTypeLabelProvider implements ILabelProvider<TicketStateType> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_STATE_TYPE;

    public isLabelProviderFor(ticketStateType: TicketStateType): boolean {
        return ticketStateType instanceof TicketStateType;
    }

    public async getPropertyText(
        property: string, ticketStateType?: TicketStateType, short?: boolean
    ): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketStateProperty.NAME:
                displayValue = 'Name';
                break;
            case 'ICON':
                displayValue = 'Icon';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public getDisplayText(ticketStateType: TicketStateType, property: string): Promise<string> {
        let displayValue = ticketStateType[property];

        switch (property) {
            case 'ICON':
                displayValue = ticketStateType.Name;
                break;
            default:
        }
        return displayValue;
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(ticketStateType: TicketStateType, property: string): string[] {
        return [];
    }

    public getObjectClasses(ticketStateType: TicketStateType): string[] {
        return [];
    }

    public async getObjectText(ticketStateType: TicketStateType, id?: boolean, title?: boolean): Promise<string> {
        return ticketStateType.Name;
    }

    public getObjectAdditionalText(ticketStateType: TicketStateType): string {
        return null;
    }

    public getObjectIcon(ticketState?: TicketStateType): string | ObjectIcon {
        return null;
    }

    public getObjectName(plural?: boolean): string {
        return plural ? 'Statustypen' : 'Statustyp';
    }

    public getObjectTooltip(ticketStateType: TicketStateType): string {
        return ticketStateType.Name;
    }

    public async getIcons(
        ticketStateType: TicketStateType, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === 'ICON') {
            return [new ObjectIcon('StateTypes', ticketStateType.ID)];
        }
        return null;
    }

}
