import { ILabelProvider } from "../ILabelProvider";
import { TicketState, KIXObjectType, ObjectIcon, TicketStateProperty, DateTimeUtil, User } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";
import { KIXObjectService } from "../kix";

export class TicketStateLabelProvider implements ILabelProvider<TicketState> {

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
                displayValue = 'Translatable#State type';
                break;
            case TicketStateProperty.CREATED_BY:
                displayValue = 'Translatable#Created by';
                break;
            case TicketStateProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case TicketStateProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case TicketStateProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case TicketStateProperty.VALID_ID:
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

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
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
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
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
            case TicketStateProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case TicketStateProperty.CREATED_BY:
            case TicketStateProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case TicketStateProperty.CREATE_TIME:
            case TicketStateProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue.toString();
    }

    public getDisplayTextClasses(ticketState: TicketState, property: string): string[] {
        return [];
    }

    public getObjectClasses(ticketState: TicketState): string[] {
        return [];
    }

    public async getObjectText(ticketState: TicketState, id?: boolean, title?: boolean): Promise<string> {
        return ticketState.Name;
    }

    public getObjectAdditionalText(ticketState: TicketState): string {
        return null;
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
