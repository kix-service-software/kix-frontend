import { ILabelProvider } from "..";
import {
    DateTimeUtil, ObjectIcon, KIXObjectType, KIXObject
} from "../../model";
import { ContextService } from "../context";
import { FAQArticleHistoryProperty, FAQHistory } from "../../model/kix/faq";

export class FAQArticleHistoryLabelProvider implements ILabelProvider<FAQHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE_HISTORY;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public async getPropertyText(property: string, object?: KIXObject): Promise<string> {
        let displayValue = property;
        switch (property) {
            case FAQArticleHistoryProperty.ARTICLE_ID:
                displayValue = 'Artikel Id';
                break;
            case FAQArticleHistoryProperty.CREATED:
                displayValue = 'Erstellt am';
                break;
            case FAQArticleHistoryProperty.CREATED_BY:
                displayValue = 'Benutzer';
                break;
            case FAQArticleHistoryProperty.ID:
                displayValue = 'Id';
                break;
            case FAQArticleHistoryProperty.NAME:
                displayValue = 'Aktion';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getDisplayText(history: FAQHistory, property: string): Promise<string> {
        const value = history[property];
        let displayValue = value;

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case FAQArticleHistoryProperty.CREATED_BY:
                const user = objectData.users.find((u) => u.UserID === history.CreatedBy);
                displayValue = user ? user.UserFullname : history.CreatedBy;
                break;
            case FAQArticleHistoryProperty.CREATED:
                displayValue = DateTimeUtil.getLocalDateTimeString(value);
                break;
            default:
                displayValue = String(value);
        }

        return displayValue;
    }

    public getDisplayTextClasses(history: FAQHistory, property: string): string[] {
        return [];
    }

    public getObjectClasses(history: FAQHistory): string[] {
        return [];
    }

    public isLabelProviderFor(history: FAQHistory): boolean {
        return history instanceof FAQHistory;
    }

    public async getObjectText(history: FAQHistory): Promise<string> {
        return history.ID.toString();
    }

    public getObjectAdditionalText(history: FAQHistory): string {
        return null;
    }

    public getObjectIcon(history: FAQHistory): string | ObjectIcon {
        return 'kix-icon-faq';
    }

    public getObjectTooltip(history: FAQHistory): string {
        return history.Name;
    }

    public getObjectName(plural: boolean = false): string {
        return plural ? "FAQ" : "FAQs";
    }

    public async getIcons(object: FAQHistory, property: string): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}
