/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { DateTimeAPIUtil } from '../../../server/services/DateTimeAPIUtil';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
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
                const date = new Date(1970, 0, 1);
                date.setSeconds(date.getSeconds() + Number(displayValue));
                displayValue = await DateTimeAPIUtil.getLocalDateTimeString(token, date.getTime());
                break;
            case ArticleProperty.CHANNEL_ID:
            case ArticleProperty.CHANNEL:
                if (displayValue) {
                    const objectResponse = await ChannelAPIService.getInstance().loadObjects<Channel>(
                        token, 'ArticleLabelProvider', KIXObjectType.CHANNEL, null, null, null
                    ).catch(() => new ObjectResponse<Channel>());

                    const channels = objectResponse?.objects || [];
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
                const channelResponse = await ChannelAPIService.getInstance().loadObjects<Channel>(
                    token, 'ArticleLabelProvider', KIXObjectType.CHANNEL, [article.ChannelID], null, null
                ).catch(() => new ObjectResponse<Channel>());
                const channels = channelResponse?.objects || [];
                if (channels.length && channels[0].Name === 'email') {
                    const mailIcon = article && article.isUnsent()
                        ? 'kix-icon-mail-warning'
                        : new ObjectIcon(null, 'Channel', article.ChannelID);
                    let directionIcon = 'kix-icon-arrow-receive';

                    const objectResponse = await TicketAPIService.getInstance().loadObjects<SenderType>(
                        token, 'ArticleLabelProvider', KIXObjectType.SENDER_TYPE, [article.SenderTypeID], null, null
                    ).catch(() => new ObjectResponse<SenderType>());

                    const senderTypes = objectResponse?.objects || [];
                    const senderType = senderTypes.length ? senderTypes[0] : null;
                    if (senderType?.Name === 'agent') {
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