import { ILabelProvider } from "../ILabelProvider";
import { TicketType, KIXObjectType, ObjectIcon, TicketTypeProperty, DateTimeUtil } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";

export class TicketTypeLabelProvider implements ILabelProvider<TicketType> {

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
            case TicketTypeProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case TicketTypeProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case TicketTypeProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case TicketTypeProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case TicketTypeProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case TicketTypeProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case TicketTypeProperty.ID:
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
        ticketType: TicketType, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketType[property];

        const objectData = ObjectDataService.getInstance().getObjectData();

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
            case TicketTypeProperty.ID:
                displayValue = ticketType.Name;
                break;
            default:
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
            case TicketTypeProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case TicketTypeProperty.CREATE_BY:
            case TicketTypeProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID.toString() === displayValue.toString());
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case TicketTypeProperty.CREATE_TIME:
            case TicketTypeProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue.toString();
    }

    public getDisplayTextClasses(ticketType: TicketType, property: string): string[] {
        return [];
    }

    public getObjectClasses(ticketType: TicketType): string[] {
        return [];
    }

    public async getObjectText(ticketType: TicketType, id?: boolean, title?: boolean): Promise<string> {
        const objectType = await TranslationService.translate('Translatable#Type');
        return `${objectType}: ${ticketType.Name}`;
    }

    public getObjectAdditionalText(ticketType: TicketType): string {
        return null;
    }

    public getObjectIcon(ticketType?: TicketType): string | ObjectIcon {
        return new ObjectIcon('TicketType', ticketType.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Translatable#Types' : 'Translatable#Type';
        if (translatable) {
            displayValue = await TranslationService.translate('Translatable#' + displayValue);
        }
        return displayValue;
    }

    public getObjectTooltip(ticketType: TicketType): string {
        return ticketType.Name;
    }

    public async getIcons(
        ticketType: TicketType, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketTypeProperty.ID) {
            return [new ObjectIcon('TicketType', ticketType.ID)];
        }
        return null;
    }

}
