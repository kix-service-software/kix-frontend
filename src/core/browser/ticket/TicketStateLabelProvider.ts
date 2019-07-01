import {
    TicketState, KIXObjectType, ObjectIcon, TicketStateProperty, DateTimeUtil, User, KIXObjectProperty, ValidObject
} from "../../model";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";
import { LabelProvider } from "../LabelProvider";

export class TicketStateLabelProvider extends LabelProvider<TicketState> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    public isLabelProviderFor(ticketState: TicketState): boolean {
        return ticketState instanceof TicketState;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case TicketStateProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TicketStateProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case TicketStateProperty.TYPE_NAME:
            case TicketStateProperty.TYPE_ID:
                displayValue = 'Translatable#State Type';
                break;
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case TicketStateProperty.ID:
                displayValue = 'Translatable#Icon';
                break;
            case 'ICON':
                displayValue = 'Translatable#Icon';
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
        ticketState: TicketState, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketState[property];

        switch (property) {
            case TicketStateProperty.TYPE_ID:
                displayValue = ticketState.TypeName;
                break;
            case TicketStateProperty.ID:
            case 'ICON':
                displayValue = ticketState.Name;
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

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                if (value) {
                    const validObjects = await KIXObjectService.loadObjects<ValidObject>(
                        KIXObjectType.VALID_OBJECT, [value], null, null, true
                    ).catch((error) => [] as ValidObject[]);
                    displayValue = validObjects && !!validObjects.length ? validObjects[0].Name : value;
                }
                break;
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case KIXObjectProperty.CREATE_TIME:
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(ticketState: TicketState, id?: boolean, title?: boolean): Promise<string> {
        return ticketState.Name;
    }

    public getObjectIcon(ticketState?: TicketState): string | ObjectIcon {
        return new ObjectIcon('TicketState', ticketState.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#States' : 'Translatable#State'
            );
        }
        return plural ? 'States' : 'State';
    }

    public getObjectTooltip(ticketState: TicketState): string {
        return ticketState.Name;
    }

    public async getIcons(
        ticketState: TicketState, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketStateProperty.ID || property === 'ICON') {
            return [new ObjectIcon('TicketState', ticketState.ID)];
        }
        return null;
    }

}
