import { ILabelProvider } from "..";
import { TicketHistory, DateTimeUtil, ObjectIcon, KIXObjectType, KIXObject, TicketHistoryProperty } from "../../model";
import { ContextService } from "../context";

export class TicketHistoryLabelProvider implements ILabelProvider<TicketHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_HISTORY;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public async getPropertyText(property: string): Promise<string> {
        let text = property;
        switch (property) {
            case TicketHistoryProperty.HISTORY_TYPE:
                text = 'Aktion';
                break;
            case TicketHistoryProperty.NAME:
                text = 'Kommentar';
                break;
            case TicketHistoryProperty.ARTICLE_ID:
                text = 'Zum Artikel';
                break;
            case TicketHistoryProperty.CREATE_BY:
                text = 'Benutzer';
                break;
            case TicketHistoryProperty.CREATE_TIME:
                text = 'Erstellt am';
                break;
            default:
                text = property;
        }
        return text;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(historyEntry: TicketHistory, property: string): Promise<string> {
        let displayValue = property.toString();

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case TicketHistoryProperty.ARTICLE_ID:
                displayValue = historyEntry[property] === 0 ? '' : 'Zum Artikel';
                break;
            case TicketHistoryProperty.CREATE_BY:
                const user = objectData.users.find((u) => u.UserID === historyEntry[property]);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case TicketHistoryProperty.CREATE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(historyEntry[property]);
                break;
            default:
                displayValue = historyEntry[property];
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: TicketHistory, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: TicketHistory): string[] {
        return [];
    }

    public isLabelProviderFor(object: TicketHistory): boolean {
        return object instanceof TicketHistory;
    }

    public async getObjectText(object: TicketHistory): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public getObjectAdditionalText(object: TicketHistory): string {
        throw new Error("Method not implemented.");
    }

    public getObjectIcon(object: TicketHistory): string | ObjectIcon {
        throw new Error("Method not implemented.");
    }

    public getObjectTooltip(object: TicketHistory): string {
        throw new Error("Method not implemented.");
    }

    public getObjectName(): string {
        return "Ticket Historie";
    }

    public async getIcons(object: TicketHistory, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === TicketHistoryProperty.ARTICLE_ID && object.ArticleID) {
            icons.push('kix-icon-open-right');
        }
        return icons;
    }

}
