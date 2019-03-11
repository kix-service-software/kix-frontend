import { ILabelProvider } from "../ILabelProvider";
import { KIXObjectType, ObjectIcon, TicketStateProperty, DateTimeUtil, TicketStateType } from "../../model";
import { ContextService } from "../context";
import { TranslationService } from "../i18n/TranslationService";

export class TicketStateTypeLabelProvider implements ILabelProvider<TicketStateType> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_STATE_TYPE;

    public isLabelProviderFor(ticketStateType: TicketStateType): boolean {
        return ticketStateType instanceof TicketStateType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketStateProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TicketStateProperty.ID:
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
        ticketStateType: TicketStateType, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketStateType[property];

        switch (property) {
            case TicketStateProperty.ID:
                displayValue = ticketStateType.Name;
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'State Type' : 'State Types';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }
        return displayValue;
    }

    public getObjectTooltip(ticketStateType: TicketStateType): string {
        return ticketStateType.Name;
    }

    public async getIcons(
        ticketStateType: TicketStateType, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketStateProperty.ID) {
            return [new ObjectIcon('StateTypes', ticketStateType.ID)];
        }
        return null;
    }

}
