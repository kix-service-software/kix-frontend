/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketService } from './TicketService';
import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { Article } from '../../model/Article';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ArticleProperty } from '../../model/ArticleProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Channel } from '../../model/Channel';
import { SenderType } from '../../model/SenderType';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { KIXObject } from '../../../../model/kix/KIXObject';


export class ArticleLabelProvider extends LabelProvider<Article> {

    public kixObjectType: KIXObjectType = KIXObjectType.ARTICLE;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue;
        switch (property) {
            case ArticleProperty.TO:
                displayValue = 'Translatable#To';
                break;
            case ArticleProperty.CC:
                displayValue = 'Translatable#Cc';
                break;
            case ArticleProperty.BCC:
                displayValue = 'Translatable#Bcc';
                break;
            case ArticleProperty.ARTICLE_INFORMATION:
                displayValue = 'Translatable#New';
                break;
            case ArticleProperty.NUMBER:
                displayValue = 'Translatable#No.';
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                displayValue = 'Translatable#Show in Customer Portal';
                break;
            case ArticleProperty.SENDER_TYPE_ID:
                displayValue = 'Translatable#Sender Type';
                break;
            case ArticleProperty.FROM:
                displayValue = 'Translatable#From';
                break;
            case ArticleProperty.SUBJECT:
                displayValue = 'Translatable#Subject';
                break;
            case ArticleProperty.INCOMING_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case ArticleProperty.ATTACHMENTS:
                displayValue = 'Translatable#Attachments';
                break;
            case ArticleProperty.CHANNEL_ID:
                displayValue = 'Translatable#Channel';
                break;
            case ArticleProperty.BODY:
                displayValue = 'Translatable#Body';
                break;
            default:
                displayValue = property;
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined
            );
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        if (property === ArticleProperty.CUSTOMER_VISIBLE) {
            return 'kix-icon-men';
        }
        return;
    }

    public async getDisplayText(
        article: Article, property: string, defaultValue?: string, translatable: boolean = true, short: boolean = true
    ): Promise<string> {
        let displayValue = typeof defaultValue !== 'undefined' && defaultValue !== null
            ? defaultValue : article[property];
        switch (property) {
            case ArticleProperty.SENDER_TYPE_ID:
                const senderTypes = await KIXObjectService.loadObjects<SenderType>(
                    KIXObjectType.SENDER_TYPE, [article.SenderTypeID]
                ).catch((error) => []);

                displayValue = senderTypes && senderTypes.length ?
                    typeof senderTypes[0] === 'object' ? senderTypes[0].Name : senderTypes[0] : null;
                break;
            case ArticleProperty.TO:
                displayValue = article.toList.length ? short
                    ? article.toList[0].email : article.toList.map((to) => to.email).join(', ') : '';
                break;
            case ArticleProperty.CC:
                displayValue = article.ccList.length ? short
                    ? article.ccList[0].email : article.ccList.map((cc) => cc.email).join(', ') : '';
                break;
            case ArticleProperty.BCC:
                displayValue = article.bccList.length ? short
                    ? article.bccList[0].email : article.bccList.map((bcc) => bcc.email).join(', ') : '';
                break;
            case ArticleProperty.ARTICLE_INFORMATION:
                displayValue = article.isUnread() ? 'Translatable#Unread' : 'Translatable#Read';
                break;
            case ArticleProperty.BODY_RICHTEXT:
                if (article) {
                    const prepareContent = await TicketService.getInstance().getPreparedArticleBodyContent(article);
                    if (prepareContent) {
                        displayValue = BrowserUtil.replaceInlineContent(prepareContent[0], prepareContent[1]);
                    }
                    translatable = false;
                }
                break;
            default:
                displayValue = await super.getDisplayText(article, property, defaultValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case ArticleProperty.ARTICLE_TAG:
                displayValue = '';
                break;
            case ArticleProperty.SENDER_TYPE_ID:
                const checkNumber = Number(value);
                if (!isNaN(checkNumber)) {
                    if (checkNumber === 1) {
                        displayValue = 'Translatable#agent';
                    } else if (checkNumber === 2) {
                        displayValue = 'Translatable#system';
                    } else if (checkNumber === 3) {
                        displayValue = 'Translatable#external';
                    }
                }
                break;
            case ArticleProperty.INCOMING_TIME:
                if (displayValue) {
                    displayValue = translatable
                        ? await DateTimeUtil.getLocalDateTimeString(Number(displayValue) * 1000)
                        : Number(displayValue) * 1000;
                }
                break;
            case ArticleProperty.ATTACHMENTS:
                if (displayValue) {
                    const attachments = displayValue.filter((a) => a.Disposition !== 'inline' || a.ContentID.length === 0 && !a.Filename.match(/^file-(1|2)$/));
                    if (attachments.length > 0) {
                        displayValue = '(' + attachments.length + ')';
                    }
                } else {
                    displayValue = '';
                }
                break;
            case ArticleProperty.CHANNEL_ID:
            case ArticleProperty.CHANNEL:
                if (displayValue) {
                    const channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL);
                    if (channels) {
                        const channel = channels.find((c) => c.ID.toString() === displayValue.toString());
                        displayValue = channel ? channel.Name : displayValue;
                        if (displayValue === 'email') {
                            displayValue = 'Translatable#Email';
                        } else if (displayValue === 'note') {
                            displayValue = 'Translatable#Note';
                        }
                    }
                }
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                displayValue = displayValue ? 'Translatable#Yes' : 'Translatable#No';
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(article: Article, property: string): string[] {
        const classes = [];
        if (property === ArticleProperty.ARTICLE_INFORMATION && article.isUnread()) {
            classes.push('unseen');
        }
        return classes;
    }

    public getObjectClasses(article: Article): string[] {
        const classes = [];
        if (article.isUnread()) {
            classes.push('article-unread');
        }
        return classes;
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof Article || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(article: Article): Promise<string> {
        return article.Subject;
    }

    public getObjectAdditionalText(article: Article): string {
        return '';
    }

    public getObjectIcon(article: Article): string | ObjectIcon {
        return null;
    }

    public async getObjectTooltip(article: Article, translatable: boolean = false): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(article.Subject);
        }
        return article.Subject;
    }

    public async getObjectName(): Promise<string> {
        return await TranslationService.translate('Translatable#Article');
    }

    public async getIcons(article: Article, property: string, value: any): Promise<Array<string | ObjectIcon>> {
        const icons = [];

        const channelID = value && value !== ''
            ? value
            : article ? article.ChannelID : null
            ;
        switch (property) {
            case ArticleProperty.ATTACHMENTS:
                if (article.Attachments) {
                    const attachments = article.Attachments.filter((a) => a.Disposition !== 'inline' || a.ContentID.length === 0 && !a.Filename.match(/^file-(1|2)$/));
                    if (attachments.length > 0) {
                        icons.push('kix-icon-attachement');
                    }
                }
                break;
            case ArticleProperty.ARTICLE_INFORMATION:
                if (article.isUnread()) {
                    icons.push('kix-icon-info');
                }
                break;
            case ArticleProperty.CHANNEL_ID:
                if (channelID) {
                    if (article) {
                        const channels = await KIXObjectService.loadObjects<Channel>(
                            KIXObjectType.CHANNEL, [channelID]
                        );
                        if (channels && channels.length && channels[0].Name === 'email') {
                            const mailIcon = article && article.isUnsent()
                                ? 'kix-icon-mail-warning'
                                : new ObjectIcon(null, 'Channel', channelID);
                            let directionIcon = 'kix-icon-arrow-receive';

                            const senderTypes = await KIXObjectService.loadObjects<SenderType>(
                                KIXObjectType.SENDER_TYPE, [article.SenderTypeID]
                            ).catch((error) => []);

                            const senderType = senderTypes && senderTypes.length ? senderTypes[0] : '';
                            if (article && senderType.Name === 'agent') {
                                directionIcon = 'kix-icon-arrow-outward';
                            }
                            icons.push(mailIcon);
                            icons.push(directionIcon);
                        } else {
                            icons.push(new ObjectIcon(null, 'Channel', channelID));
                        }
                    } else {
                        icons.push(new ObjectIcon(null, 'Channel', channelID));
                    }
                }
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                if (article && article.CustomerVisible) {
                    icons.push('kix-icon-check');
                }
                break;
            default:
        }
        return icons;
    }

}
