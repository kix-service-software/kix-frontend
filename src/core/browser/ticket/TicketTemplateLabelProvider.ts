import {
    KIXObjectType, ObjectIcon, TicketTemplate, TicketTemplateProperty, User, DateTimeUtil, ValidObject
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";
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
                displayValue = 'Translatable#Icon';
                break;
            case 'ICON':
                displayValue = 'Translatable#Icon';
                break;
            case TicketTemplateProperty.TYPE_ID:
                displayValue = 'Translatable#Type';
                break;
            case TicketTemplateProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case TicketTemplateProperty.CHANNEL_ID:
                displayValue = 'Translatable#Channel';
                break;
            case TicketTemplateProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case TicketTemplateProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case TicketTemplateProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case TicketTemplateProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case TicketTemplateProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            default:
                displayValue = property;
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
            case TicketTemplateProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                const valid = validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case TicketTemplateProperty.CREATE_BY:
            case TicketTemplateProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case TicketTemplateProperty.CREATE_TIME:
            case TicketTemplateProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
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
