import { TicketType, KIXObjectType, ObjectIcon, TicketTypeProperty } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

export class TicketTypeLabelProvider extends LabelProvider<TicketType> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

    public isLabelProviderFor(ticketType: TicketType): boolean {
        return ticketType instanceof TicketType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case TicketTypeProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TicketTypeProperty.ID:
            case 'ICON':
                displayValue = 'Translatable#Icon';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        ticketType: TicketType, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketType[property] || '';

        switch (property) {
            case TicketTypeProperty.ID:
            case 'ICON':
                displayValue = ticketType.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(ticketType: TicketType, id?: boolean, title?: boolean): Promise<string> {
        return ticketType.Name;
    }

    public getObjectIcon(ticketType?: TicketType): string | ObjectIcon {
        return new ObjectIcon('TicketType', ticketType.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Types' : 'Translatable#Type'
            );
        }
        return plural ? 'Types' : 'Type';
    }

    public getObjectTooltip(ticketType: TicketType): string {
        return ticketType.Name;
    }

    public async getIcons(
        ticketType: TicketType, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketTypeProperty.ID || property === 'ICON') {
            return [new ObjectIcon('TicketType', ticketType.ID)];
        }
        return null;
    }

}
