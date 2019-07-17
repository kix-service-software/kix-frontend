import { KIXObjectType, ObjectIcon, TicketTemplate, TicketTemplateProperty } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

export class TicketTemplateLabelProvider extends LabelProvider<TicketTemplate> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_TEMPLATE;

    public isLabelProviderFor(ticketTemplate: TicketTemplate): boolean {
        return ticketTemplate instanceof TicketTemplate;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketTemplateProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TicketTemplateProperty.ID:
            case 'ICON':
                displayValue = 'Translatable#Icon';
                break;
            case TicketTemplateProperty.TYPE_ID:
                displayValue = 'Translatable#Type';
                break;
            case TicketTemplateProperty.CHANNEL_ID:
                displayValue = 'Translatable#Channel';
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
        ticketTemplate: TicketTemplate, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketTemplate[property];

        switch (property) {
            case TicketTemplateProperty.ID:
                displayValue = ticketTemplate.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable?: boolean
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            // TODO: ChannelID und TypeID auflösen
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue.toString();
    }

    public async getObjectText(ticketTemplate: TicketTemplate, id?: boolean, title?: boolean): Promise<string> {
        return ticketTemplate.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Templates' : 'Translatable#Template'
            );
        }
        return plural ? 'Templates' : 'Template';
    }

    public getObjectTooltip(ticketTemplate: TicketTemplate): string {
        return ticketTemplate.Name;
    }

    public async getIcons(
        ticketTemplate: TicketTemplate, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketTemplateProperty.ID) {
            return [new ObjectIcon('TicketTemplates', ticketTemplate.ID)];
        }
        return null;
    }

}
