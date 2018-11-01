import {
    LoadArticleAttachmentResponse, LoadArticleAttachmentRequest, SetArticleSeenFlagRequest,
    TicketEvent, LoadArticleZipAttachmentRequest,
} from '@kix/core/dist/model/';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class TicketCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'tickets';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, TicketEvent.LOAD_ARTICLE_ATTACHMENT, this.loadArticleAttachment.bind(this));
        this.registerEventHandler(
            client, TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT, this.loadArticleZipAttachment.bind(this)
        );
        this.registerEventHandler(client, TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, this.removeArticleSeenFlag.bind(this));
    }

    private async loadArticleAttachment(
        data: LoadArticleAttachmentRequest
    ): Promise<CommunicatorResponse<LoadArticleAttachmentResponse>> {
        const attachemnt = await this.ticketService.loadArticleAttachment(
            data.token, data.ticketId, data.articleId, data.attachmentId
        );

        const response = new LoadArticleAttachmentResponse(attachemnt);
        return new CommunicatorResponse(TicketEvent.ARTICLE_ATTACHMENT_LOADED, response);
    }

    private async loadArticleZipAttachment(
        data: LoadArticleZipAttachmentRequest
    ): Promise<CommunicatorResponse<LoadArticleAttachmentResponse>> {
        const attachemnt = await this.ticketService.loadArticleZipAttachment(
            data.token, data.ticketId, data.articleId
        );

        const response = new LoadArticleAttachmentResponse(attachemnt);
        return new CommunicatorResponse(TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED, response);
    }

    private async removeArticleSeenFlag(data: SetArticleSeenFlagRequest): Promise<CommunicatorResponse<void>> {
        await this.ticketService.setArticleSeenFlag(data.token, data.ticketId, data.articleId);
        return new CommunicatorResponse(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE);
    }
}
