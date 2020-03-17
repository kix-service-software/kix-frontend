/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from "../../../../../../server/model/rest/RequestObject";
import { CreateAttachment } from "./CreateAttachment";
import { ArticleProperty } from "../../model/ArticleProperty";

export class CreateArticle extends RequestObject {

    public constructor(
        subject: string, body: string, contentType: string, mimeType: string, charset: string,
        channelId?: number, senderTypeId?: number, autoResponseType?: string, from?: string, historyType?: string,
        historyComment?: string, timeUnit?: string, noAgentNotify?: boolean, forceNotificationToUserID?: number[],
        excludeNotificationToUserID?: number[], excludeMuteNotificationToUserID?: number[],
        attachments?: CreateAttachment[], customerVisible?: boolean,
        to?: string, cc?: string, bcc?: string, referencedArticleId?: number, execReply?: number, execForward?: number
    ) {
        super();

        this.applyProperty(ArticleProperty.SUBJECT, subject);
        this.applyProperty(ArticleProperty.BODY, body);
        this.applyProperty(ArticleProperty.CONTENT_TYPE, contentType);
        this.applyProperty(ArticleProperty.MIME_TYPE, mimeType);
        this.applyProperty(ArticleProperty.CHARSET, charset);
        this.applyProperty(ArticleProperty.CHANNEL_ID, channelId);
        this.applyProperty(ArticleProperty.SENDER_TYPE_ID, senderTypeId);
        this.applyProperty('AutoResponseType', autoResponseType);
        this.applyProperty(ArticleProperty.FROM, from);
        this.applyProperty('HistoryType', historyType);
        this.applyProperty('HistoryComment', historyComment);
        this.applyProperty(ArticleProperty.TIME_UNITS, timeUnit);
        this.applyProperty('NoAgentNotify', noAgentNotify);
        this.applyProperty('ForceNotificationToUserID', forceNotificationToUserID);
        this.applyProperty('ExcludeNotificationToUserID', excludeNotificationToUserID);
        this.applyProperty('ExcludeMuteNotificationToUserID', excludeMuteNotificationToUserID);
        this.applyProperty(ArticleProperty.ATTACHMENTS, attachments);
        this.applyProperty(ArticleProperty.CUSTOMER_VISIBLE, Number(customerVisible));
        this.applyProperty(ArticleProperty.TO, to);
        this.applyProperty(ArticleProperty.CC, cc);
        this.applyProperty(ArticleProperty.BCC, bcc);
        if (referencedArticleId) {
            this.applyProperty(ArticleProperty.REFERENCED_ARTICLE_ID, referencedArticleId);
            if (execReply) {
                this.applyProperty(ArticleProperty.EXEC_REPLY, execReply);
            } else if (execForward) {
                this.applyProperty(ArticleProperty.EXEC_FORWARD, execForward);
            }
        }
    }

}
