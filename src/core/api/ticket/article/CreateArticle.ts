import { CreateAttachment } from '..';
import { DynamicField } from '../../../model';
import { RequestObject } from '../../RequestObject';

export class CreateArticle extends RequestObject {

    public constructor(
        subject: string, body: string, contentType: string, mimeType: string, charset: string,
        articleTypeId?: number, senderTypeId?: number, autoResponseType?: string, from?: string, historyType?: string,
        historyComment?: string, timeUnit?: string, noAgentNotify?: boolean, forceNotificationToUserID?: number[],
        excludeNotificationToUserID?: number[], excludeMuteNotificationToUserID?: number[],
        dynamicFields?: DynamicField[], attachments?: CreateAttachment[]
    ) {
        super();

        this.applyProperty("Subject", subject);
        this.applyProperty("Body", body);
        this.applyProperty("ContentType", contentType);
        this.applyProperty("MimeType", mimeType);
        this.applyProperty("Charset", charset);
        this.applyProperty("ArticleTypeID", articleTypeId);
        this.applyProperty("SenderTypeID", senderTypeId);
        this.applyProperty("AutoResponseType", autoResponseType);
        this.applyProperty("From", from);
        this.applyProperty("HistoryType", historyType);
        this.applyProperty("HistoryComment", historyComment);
        this.applyProperty("TimeUnit", timeUnit);
        this.applyProperty("NoAgentNotify", noAgentNotify);
        this.applyProperty("ForceNotificationToUserID", forceNotificationToUserID);
        this.applyProperty("ExcludeNotificationToUserID", excludeNotificationToUserID);
        this.applyProperty("ExcludeMuteNotificationToUserID", excludeMuteNotificationToUserID);
        this.applyProperty("DynamicFields", dynamicFields);
        this.applyProperty("Attachments", attachments);
    }

}
