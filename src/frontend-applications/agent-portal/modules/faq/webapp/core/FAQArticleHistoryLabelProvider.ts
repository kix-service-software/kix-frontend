/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { FAQHistory } from '../../model/FAQHistory';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FAQArticleHistoryProperty } from '../../model/FAQArticleHistoryProperty';

import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';

import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';



export class FAQArticleHistoryLabelProvider extends LabelProvider<FAQHistory> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE_HISTORY;

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
                displayValue = 'Translatable#Created by';
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

    public isLabelProviderFor(object: FAQHistory | KIXObject): boolean {
        return object instanceof FAQHistory || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(history: FAQHistory): Promise<string> {
        return history.ID.toString();
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-faq';
    }

    public async getObjectTooltip(history: FAQHistory, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(history.Name);
        }
        return history.Name;
    }

    public async getObjectName(plural: boolean = false): Promise<string> {
        return await TranslationService.translate('Translatable#FAQ Article History');
    }

}
