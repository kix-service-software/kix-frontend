/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler } from "../../../../modules/base-components/webapp/core/IPlaceholderHandler";
import { Article } from "../../model/Article";
import { PlaceholderService } from "../../../../modules/base-components/webapp/core/PlaceholderService";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ArticleProperty } from "../../model/ArticleProperty";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { DateTimeUtil } from "../../../../modules/base-components/webapp/core/DateTimeUtil";
import { TranslationService } from "../../../../modules/translation/webapp/core/TranslationService";

export class ArticlePlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'ArticlePlaceholderHandler';

    public isHandlerFor(objectString: string): boolean {
        return false;
    }

    public async replace(placeholder: string, article: Article, language?: string): Promise<string> {
        let result = '';
        if (article) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
            if (attribute && this.isKnownProperty(attribute)) {
                const articleLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.ARTICLE);
                if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
                    language = 'en';
                }
                switch (attribute) {
                    case 'ID':
                        result = article.ArticleID.toString();
                        break;
                    case ArticleProperty.TICKET_ID:
                    case ArticleProperty.SENDER_TYPE_ID:
                    case ArticleProperty.MESSAGE_ID:
                        result = article[attribute] ? article[attribute].toString() : '';
                        break;
                    case ArticleProperty.SUBJECT:
                    case ArticleProperty.BODY:
                        result = await articleLabelProvider.getDisplayText(article, attribute, undefined, false);
                        if (optionsString && Number.isInteger(Number(optionsString))) {
                            result = result.substr(0, Number(optionsString));
                        }
                        break;
                    case ArticleProperty.BODY_RICHTEXT:
                    case ArticleProperty.FROM_REALNAME:
                    case ArticleProperty.TO_REALNAME:
                    case ArticleProperty.CC_REALNAME:
                    case ArticleProperty.BCC_REALNAME:
                        result = await articleLabelProvider.getDisplayText(article, attribute, undefined, false);
                        break;
                    case ArticleProperty.FROM:
                    case ArticleProperty.TO:
                    case ArticleProperty.CC:
                    case ArticleProperty.BCC:
                        result = await articleLabelProvider.getDisplayText(article, attribute, undefined, false, false);
                        result = result.toString().replace('<', '&lt;').replace('>', '&gt;');
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        result = await DateTimeUtil.getLocalDateTimeString(article[attribute], language);
                        break;
                    default:
                        result = await articleLabelProvider.getDisplayText(article, attribute, undefined, false);
                        result = typeof result !== 'undefined' && result !== null
                            ? await TranslationService.translate(result.toString(), undefined, language) : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(ArticleProperty).map((p) => ArticleProperty[p]);
        knownProperties = [...knownProperties, ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])];
        return property === 'ID' || knownProperties.some((p) => p === property);
    }
}
