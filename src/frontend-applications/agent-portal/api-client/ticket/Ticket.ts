import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { Attachment } from '../../model/kix/Attachment';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { BrowserCacheService } from '../../modules/base-components/webapp/core/CacheService';
import { APIClient } from '../APIClient';

export class TicketAPIClient extends APIClient {

    public static async loadArticleAttachment(
        ticketId: number, articleId: number, attachmentId: number, asDownload?: boolean
    ): Promise<Attachment> {
        const attachments = await this.loadArticleAttachments(ticketId, articleId, [attachmentId], asDownload);
        return attachments?.length ? attachments[0] : null;
    }

    public static async loadArticleAttachments(
        ticketId: number, articleId: number, attachmentIds: number[], asDownload?: boolean
    ): Promise<Attachment[]> {
        // FIXME: Caching
        // const cacheKey = `${ticketId}-${articleId}-${attachmentIds.join(',')}-${asDownload}`;
        const response = await this.executeRequest(
            RequestMethod.GET, `/tickets/${ticketId}/articles/${articleId}`, undefined, undefined, attachmentIds
        );
        const result = await response.json();
        return result.attachments.map((a) => new Attachment(a));
    }

    public static async downloadArticleZipAttachment(ticketId: number, articleId: number): Promise<void> {
        const url = this.getUrl(`/tickets/${ticketId}/articles/${articleId}/zip`);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    public static async setArticleSeenFlag(ticketId, articleId): Promise<void> {
        await this.executeRequest(RequestMethod.POST, `/tickets/${ticketId}/articles/${articleId}/seen`);
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.TICKET);
    }

}