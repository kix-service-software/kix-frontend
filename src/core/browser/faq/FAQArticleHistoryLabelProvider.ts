import { ILabelProvider } from '..';
import { DateTimeUtil, ObjectIcon, KIXObjectType } from '../../model';
import { FAQArticleHistoryProperty, FAQHistory } from '../../model/kix/faq';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';

export class FAQArticleHistoryLabelProvider implements ILabelProvider<FAQHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE_HISTORY;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case FAQArticleHistoryProperty.ARTICLE_ID:
                displayValue = 'Translatable#Article Id';
                break;
            case FAQArticleHistoryProperty.CREATED:
                displayValue = 'Translatable#Created at';
                break;
            case FAQArticleHistoryProperty.CREATED_BY:
                displayValue = 'Translatable#User';
                break;
            case FAQArticleHistoryProperty.ID:
                displayValue = 'Translatable#Id';
                break;
            case FAQArticleHistoryProperty.NAME:
                displayValue = 'Translatable#Action';
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
        history: FAQHistory, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        const value = history[property];
        let displayValue = value;

        const objectData = ObjectDataService.getInstance().getObjectData();

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

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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

    public async getObjectName(plural: boolean = false): Promise<string> {
        return await TranslationService.translate('Translatable#FAQ Article History');
    }

    public async getIcons(object: FAQHistory, property: string): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}
