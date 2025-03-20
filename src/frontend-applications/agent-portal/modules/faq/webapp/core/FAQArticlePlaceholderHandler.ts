/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { FAQCategory } from '../../model/FAQCategory';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FAQArticleHandler } from './FAQArticleHandler';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';

export class FAQArticlePlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '400-FAQArticlePlaceholderHandler';

    protected objectStrings: string[] = ['FAQ'];

    private relevantIdAttribut = {
        'Category': FAQArticleProperty.CATEGORY_ID
    };

    public async replace(
        placeholder: string, faqArticle?: FAQArticle, language?: string, forRichtext?: boolean,
        translate: boolean = true
    ): Promise<string> {
        let result = '';
        if (faqArticle) {
            let attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);

            if (
                PlaceholderService.getInstance().isDynamicFieldAttribute(attribute) &&
                DynamicFieldValuePlaceholderHandler
            ) {
                const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
                result = await DynamicFieldValuePlaceholderHandler.getInstance().replaceDFValue(
                    faqArticle, optionsString, language, forRichtext, translate
                );
            }
            else if (attribute && this.isKnownProperty(attribute)) {
                switch (attribute) {
                    case FAQArticleProperty.ID:
                    case KIXObjectProperty.VALID_ID:
                    case FAQArticleProperty.CATEGORY_ID:
                        result = faqArticle[attribute] ? faqArticle[attribute].toString() : '';
                        break;
                    case FAQArticleProperty.CATEGORY_FULLNAME:
                    case FAQArticleProperty.CATEGORY:
                        if (faqArticle.CategoryID) {
                            const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
                                KIXObjectType.FAQ_CATEGORY
                            ).catch(() => [] as FAQCategory[]);
                            const category = faqCategories.find((fc) => fc.ID === faqArticle.CategoryID);
                            if (category) {
                                result = attribute === FAQArticleProperty.CATEGORY ? category.Name : category.Fullname;
                            }
                        }
                        break;
                    case FAQArticleProperty.TITLE:
                        result = await LabelService.getInstance().getDisplayText(
                            faqArticle, attribute, undefined, false
                        );
                        break;
                    case FAQArticleProperty.CREATED:
                    case FAQArticleProperty.CHANGED:
                        if (translate) {
                            result = await DateTimeUtil.getLocalDateTimeString(faqArticle[attribute], language);
                        } else {
                            result = faqArticle[attribute];
                        }
                        break;
                    case FAQArticleProperty.APPROVED:
                    case FAQArticleProperty.CONTENT_TYPE:
                    case FAQArticleProperty.LINK:
                    case FAQArticleProperty.ATTACHMENTS:
                        break;
                    case FAQArticleProperty.FIELD_1_NO_INLINE:
                    case FAQArticleProperty.FIELD_2_NO_INLINE:
                    case FAQArticleProperty.FIELD_3_NO_INLINE:
                    case FAQArticleProperty.FIELD_4_NO_INLINE:
                    case FAQArticleProperty.FIELD_5_NO_INLINE:
                    case FAQArticleProperty.FIELD_6_NO_INLINE:
                        const property = attribute.replace(/(.+)NoInline/, '$1');
                        const value = faqArticle[property];
                        if (value) {
                            return value.replace(/<img.+?src="cid:.+?>/, '');
                        }
                        break;
                    case FAQArticleProperty.FIELD_1:
                    case FAQArticleProperty.FIELD_2:
                    case FAQArticleProperty.FIELD_3:
                    case FAQArticleProperty.FIELD_4:
                    case FAQArticleProperty.FIELD_5:
                    case FAQArticleProperty.FIELD_6:
                        result = await this.getPreparedFieldValue(attribute, faqArticle);
                        break;
                    default:
                        attribute = this.relevantIdAttribut[attribute] || attribute;
                        result = await LabelService.getInstance().getDisplayText(
                            faqArticle, attribute, undefined, false
                        );
                        result = typeof result !== 'undefined' && result !== null
                            ? translate ? await TranslationService.translate(result.toString(), undefined, language)
                                : result.toString() : '';
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

    private async getPreparedFieldValue(property: string, faqArticle: FAQArticle): Promise<string> {
        let fieldValue = faqArticle[property];
        if (fieldValue?.match(/<img.+?src="cid:.+?>/)) {
            if (!faqArticle.Attachments?.length) {
                const loadingOptions = new KIXObjectLoadingOptions();
                loadingOptions.includes = [FAQArticleProperty.ATTACHMENTS];
                const faqs = await KIXObjectService.loadObjects<FAQArticle>(
                    KIXObjectType.FAQ_ARTICLE, [faqArticle.ID], loadingOptions
                ).catch(() => []);
                if (faqs?.length && faqs[0]) {
                    faqArticle = faqs[0];
                }
            }
            if (faqArticle.Attachments.length) {
                const attachments = faqArticle.Attachments.filter((a) => a.Disposition !== 'inline');
                if (attachments) {
                    const inlineContent = await FAQArticleHandler.getFAQArticleInlineContent(faqArticle);
                    fieldValue = BrowserUtil.replaceInlineContent(fieldValue, inlineContent);
                }
            }

            // remove remaining img tags
            fieldValue = fieldValue.replace(/<img.+?src="cid:.+?>/, '');
        }
        return fieldValue;
    }
}
