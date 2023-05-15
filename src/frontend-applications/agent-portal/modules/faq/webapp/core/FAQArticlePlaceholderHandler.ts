/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQArticle } from '../../model/FAQArticle';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { FAQArticleProperty } from '../../model/FAQArticleProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';
import { DynamicFieldValuePlaceholderHandler } from '../../../dynamic-fields/webapp/core/DynamicFieldValuePlaceholderHandler';

export class FAQArticlePlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '400-FAQArticlePlaceholderHandler';

    protected objectStrings: string[] = ['FAQ'];

    private relevantIdAttribut = {
        'Category': FAQArticleProperty.CATEGORY_ID
    };

    public async replace(placeholder: string, faqArticle?: FAQArticle, language?: string): Promise<string> {
        let result = '';
        if (faqArticle) {
            let attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);

            if (
                PlaceholderService.getInstance().isDynamicFieldAttribute(attribute) &&
                DynamicFieldValuePlaceholderHandler
            ) {
                const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
                result = await DynamicFieldValuePlaceholderHandler.getInstance().replaceDFValue(
                    faqArticle, optionsString
                );
            }
            else if (attribute && this.isKnownProperty(attribute)) {
                switch (attribute) {
                    case FAQArticleProperty.ID:
                    case KIXObjectProperty.VALID_ID:
                    case FAQArticleProperty.CATEGORY_ID:
                        result = faqArticle[attribute] ? faqArticle[attribute].toString() : '';
                        break;
                    case FAQArticleProperty.TITLE:
                        result = await LabelService.getInstance().getDisplayText(
                            faqArticle, attribute, undefined, false
                        );
                        break;
                    case FAQArticleProperty.CREATED:
                    case FAQArticleProperty.CHANGED:
                        result = await DateTimeUtil.getLocalDateTimeString(faqArticle[attribute], language);
                        break;
                    case FAQArticleProperty.APPROVED:
                    case FAQArticleProperty.CONTENT_TYPE:
                    case FAQArticleProperty.CUSTOMER_VISIBLE:
                    case FAQArticleProperty.FIELD_1:
                    case FAQArticleProperty.FIELD_2:
                    case FAQArticleProperty.FIELD_3:
                    case FAQArticleProperty.FIELD_4:
                    case FAQArticleProperty.FIELD_5:
                    case FAQArticleProperty.FIELD_6:
                    case KIXObjectProperty.DYNAMIC_FIELDS:
                    case FAQArticleProperty.LINK:
                    case FAQArticleProperty.ATTACHMENTS:
                        break;
                    default:
                        attribute = this.relevantIdAttribut[attribute] || attribute;
                        result = await LabelService.getInstance().getDisplayText(
                            faqArticle, attribute, undefined, false
                        );
                        result = typeof result !== 'undefined' && result !== null
                            ? await TranslationService.translate(result.toString(), undefined, language) : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(FAQArticleProperty).map((p) => FAQArticleProperty[p]);
        knownProperties = [
            ...knownProperties,
            ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p]),
            ...Object.keys(this.relevantIdAttribut),
        ];
        return knownProperties.some((p) => p === property);
    }
}
