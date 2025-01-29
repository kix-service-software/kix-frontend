/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Article } from '../../model/Article';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ArticleProperty } from '../../model/ArticleProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';
import { IPlaceholderHandler } from '../../../base-components/webapp/core/IPlaceholderHandler';
import { SortUtil } from '../../../../model/SortUtil';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SystemAddress } from '../../../system-address/model/SystemAddress';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { TicketService } from './TicketService';
import { DynamicFieldValuePlaceholderHandler } from '../../../dynamic-fields/webapp/core/DynamicFieldValuePlaceholderHandler';
import { ArticleLoadingOptions } from '../../model/ArticleLoadingOptions';

export class ArticlePlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '350-ArticlePlaceholderHandler';

    private static INSTANCE: ArticlePlaceholderHandler;

    public static getInstance(): ArticlePlaceholderHandler {
        if (!ArticlePlaceholderHandler.INSTANCE) {
            ArticlePlaceholderHandler.INSTANCE = new ArticlePlaceholderHandler();
        }
        return ArticlePlaceholderHandler.INSTANCE;
    }

    private extendedPlaceholderHandler: IPlaceholderHandler[] = [];

    public isHandlerForObjectType(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.ARTICLE;
    }

    public addExtendedPlaceholderHandler(handler: IPlaceholderHandler): void {
        this.extendedPlaceholderHandler.push(handler);
    }

    public async replace(
        placeholder: string, article: Article, language?: string, forRichtext?: boolean, translate: boolean = true
    ): Promise<string> {
        let result = '';
        if (article) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
            let normalArticleAttribut: boolean = true;

            if (this.extendedPlaceholderHandler?.length && placeholder) {
                const handler = SortUtil.sortObjects(this.extendedPlaceholderHandler, 'handlerId').find(
                    (ph) => ph.isHandlerFor(placeholder)
                );
                if (handler) {
                    result = await handler.replace(placeholder, article, language, forRichtext, translate);
                    normalArticleAttribut = false;
                }
            }

            if (
                PlaceholderService.getInstance().isDynamicFieldAttribute(attribute) &&
                DynamicFieldValuePlaceholderHandler
            ) {
                if (article.DynamicFields?.length || article.TicketID) {
                    const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
                    result = await DynamicFieldValuePlaceholderHandler.getInstance().replaceDFValue(
                        article, optionsString, language, forRichtext, translate,
                        new ArticleLoadingOptions(article.TicketID)
                    );
                }
            } else if (normalArticleAttribut && attribute && this.isKnownProperty(attribute)) {
                switch (attribute) {
                    case 'ID':
                        result = article.ArticleID.toString();
                        break;
                    case ArticleProperty.TICKET_ID:
                    case ArticleProperty.SENDER_TYPE_ID:
                    case ArticleProperty.MESSAGE_ID:
                    case ArticleProperty.CHANNEL_ID:
                        result = article[attribute] ? article[attribute].toString() : '';
                        break;
                    case ArticleProperty.SUBJECT:
                    case ArticleProperty.BODY:
                        result = await LabelService.getInstance().getDisplayText(article, attribute, undefined, false);
                        if (optionsString && !isNaN(Number(optionsString))) {
                            result = result.slice(0, Number(optionsString) - 1);
                        }
                        break;
                    case ArticleProperty.BODY_RICHTEXT:
                        result = await TicketService.getInstance().getPreparedArticleBodyContent(
                            article, (isNaN(Number(optionsString)) || Number(optionsString) > 0), Number(optionsString)
                        );
                        break;
                    case ArticleProperty.BODY_RICHTEXT_NO_INLINE:
                        result = await TicketService.getInstance().getPreparedArticleBodyContent(
                            article, (isNaN(Number(optionsString)) || Number(optionsString) > 0),
                            Number(optionsString), false
                        );
                        break;
                    case ArticleProperty.FROM_REALNAME:
                    case ArticleProperty.TO_REALNAME:
                    case ArticleProperty.CC_REALNAME:
                    case ArticleProperty.BCC_REALNAME:
                        result = await LabelService.getInstance().getDisplayText(article, attribute, undefined, false);
                        break;
                    case ArticleProperty.FROM:
                    case ArticleProperty.TO:
                    case ArticleProperty.CC:
                    case ArticleProperty.BCC:
                        result = await LabelService.getInstance().getDisplayText(
                            article, attribute, undefined, undefined, false
                        );
                        if (forRichtext) {
                            result = result.replace(/>/g, '&gt;');
                            result = result.replace(/</g, '&lt;');
                        }
                        break;
                    case 'REPLYRECIPIENT':
                        let replyProperty = ArticleProperty.FROM;
                        if (article.ReplyTo) {
                            replyProperty = ArticleProperty.REPLY_TO;
                        }

                        result = await LabelService.getInstance().getDisplayText(
                            article, replyProperty, undefined, false
                        );

                        // use To value if From is a system address
                        let fromValue = typeof article.From === 'string' ? article.From : article.From.Email;
                        fromValue = fromValue.replace(/.+ <(.+)>/, '$1');
                        const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                            KIXObjectType.SYSTEM_ADDRESS, null
                        ).catch(() => [] as SystemAddress[]);
                        if (systemAddresses?.some((sa) => sa.Name === fromValue)) {
                            result = await LabelService.getInstance().getDisplayText(
                                article, ArticleProperty.TO, undefined, false
                            );
                        }
                        if (forRichtext) {
                            result = result.replace(/>/g, '&gt;');
                            result = result.replace(/</g, '&lt;');
                        }
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        if (translate) {
                            result = await DateTimeUtil.getLocalDateTimeString(article[attribute], language);
                        } else {
                            article[attribute];
                        }
                        break;
                    default:
                        if (attribute === ArticleProperty.CUSTOMER_VISIBLE && optionsString && optionsString === 'ObjectValue') {
                            return article.CustomerVisible ? '1' : '0';
                        }
                        result = await LabelService.getInstance().getDisplayText(article, attribute, undefined, false);
                        result = typeof result !== 'undefined' && result !== null
                            ? translate ? await TranslationService.translate(result.toString(), undefined, language)
                                : result.toString() : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(ArticleProperty).map((p) => ArticleProperty[p]);
        knownProperties = [...knownProperties, ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])];
        return property === 'ID' || knownProperties.some((p) => p === property) || property === 'REPLYRECIPIENT';
    }
}
