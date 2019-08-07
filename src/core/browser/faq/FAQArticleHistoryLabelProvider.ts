/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DateTimeUtil, ObjectIcon, KIXObjectType, User } from '../../model';
import { FAQArticleHistoryProperty, FAQHistory } from '../../model/kix/faq';
import { TranslationService } from '../i18n/TranslationService';
import { KIXObjectService } from '../kix';
import { LabelProvider } from '../LabelProvider';

export class FAQArticleHistoryLabelProvider extends LabelProvider<FAQHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE_HISTORY;

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

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        history: FAQHistory, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = history[property];

        switch (property) {
            case FAQArticleHistoryProperty.CREATED_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [displayValue], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : displayValue;
                break;
            case FAQArticleHistoryProperty.CREATED:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
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

    public isLabelProviderFor(history: FAQHistory): boolean {
        return history instanceof FAQHistory;
    }

    public async getObjectText(history: FAQHistory): Promise<string> {
        return history.ID.toString();
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-faq';
    }

    public getObjectTooltip(history: FAQHistory): string {
        return history.Name;
    }

    public async getObjectName(plural: boolean = false): Promise<string> {
        return await TranslationService.translate('Translatable#FAQ Article History');
    }

}
