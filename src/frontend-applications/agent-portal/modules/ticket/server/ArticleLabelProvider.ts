/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { DateTimeAPIUtil } from '../../../server/services/DateTimeAPIUtil';
import { ObjectIcon } from '../../icon/model/ObjectIcon';
import { Article } from '../model/Article';
import { ArticleProperty } from '../model/ArticleProperty';
import { Channel } from '../model/Channel';
import { SenderType } from '../model/SenderType';
import { ChannelAPIService } from './ChannelService';
import { TicketAPIService } from './TicketService';

export class ArticleLabelProvider {

    public static async getPropertyValue(token: string, article: Article, property: string): Promise<string> {
        let displayValue: string;

        switch (property) {
            case ArticleProperty.TO:
                displayValue = article.toList.length
                    ? article.toList.map((to) => to.email).join(', ')
                    : '';
                break;
            case ArticleProperty.CC:
                displayValue = article.ccList.length
                    ? article.ccList.map((cc) => cc.email).join(', ')
                    : '';
                break;
            case ArticleProperty.BCC:
                displayValue = article.bccList.length
                    ? article.bccList.map((bcc) => bcc.email).join(', ')
                    : '';
                break;
            case ArticleProperty.ARTICLE_INFORMATION:
                displayValue = article.isUnread() ? 'Translatable#Unread' : 'Translatable#Read';
                break;
            case ArticleProperty.ARTICLE_TAG:
                displayValue = '';
                break;
            case ArticleProperty.SENDER_TYPE_ID:
                const checkNumber = Number(article.SenderTypeID);
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
                displayValue = await DateTimeAPIUtil.getLocalDateTimeString(token, Number(displayValue) * 1000);
                break;
            case ArticleProperty.CHANNEL_ID:
            case ArticleProperty.CHANNEL:
                if (displayValue) {
                    const channels = await ChannelAPIService.getInstance().loadObjects<Channel>(
                        token, 'ArticleLabelProvider', KIXObjectType.CHANNEL, null, null, null
                    ).catch(() => []);

                    displayValue = channels.length ? channels[0].Name : displayValue;
                    if (displayValue === 'email') {
                        displayValue = 'Translatable#Email';
                    } else if (displayValue === 'note') {
                        displayValue = 'Translatable#Note';
                    }
                }
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                displayValue = displayValue ? 'Translatable#Yes' : 'Translatable#No';
                break;
            case ArticleProperty.SUBJECT:
                displayValue = article.Subject;
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = await DateTimeAPIUtil.getLocalDateTimeString(token, article.CreateTime);
                break;
            case ArticleProperty.FROM:
                displayValue = article.From;
                break;
            default:
        }

        return displayValue;
    }

    public static async getPropertyIcons(
        token: string, article: Article, property: string
    ): Promise<Array<ObjectIcon | string>> {
        let icons: Array<ObjectIcon | string>;

        switch (property) {
            case ArticleProperty.ATTACHMENTS:
                if (Array.isArray(article.Attachments)) {
                    const attachments = article.Attachments.filter((a) => a.Disposition !== 'inline' || a.ContentID.length === 0 && !a.Filename.match(/^file-(1|2)$/));
                    if (attachments.length > 0) {
                        icons = ['kix-icon-attachement'];
                    }
                }
                break;
            case ArticleProperty.ARTICLE_INFORMATION:
                if (article.isUnread()) {
                    icons = ['kix-icon-info'];
                }
                break;
            case ArticleProperty.CHANNEL_ID:
                const channels = await ChannelAPIService.getInstance().loadObjects<Channel>(
                    token, 'ArticleLabelProvider', KIXObjectType.CHANNEL, [article.ChannelID], null, null
                ).catch(() => []);
                if (channels.length && channels[0].Name === 'email') {
                    const mailIcon = article && article.isUnsent()
                        ? 'kix-icon-mail-warning'
                        : new ObjectIcon(null, 'Channel', article.ChannelID);
                    let directionIcon = 'kix-icon-arrow-receive';

                    const senderTypes = await TicketAPIService.getInstance().loadObjects<SenderType>(
                        token, 'ArticleLabelProvider', KIXObjectType.SENDER_TYPE, [article.SenderTypeID], null, null
                    ).catch(() => []);

                    const senderType = senderTypes.length ? senderTypes[0] : '';
                    if (senderType.Name === 'agent') {
                        directionIcon = 'kix-icon-arrow-outward';
                    }
                    icons = [mailIcon, directionIcon];
                } else {
                    icons = [new ObjectIcon(null, 'Channel', article.ChannelID)];
                }
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                if (article && article.CustomerVisible) {
                    icons = ['kix-icon-check'];
                }
                break;
            default:
        }

        return icons;
    }

}