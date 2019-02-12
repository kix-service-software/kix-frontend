import {
    LoadArticleAttachmentResponse, LoadArticleAttachmentRequest, SetArticleSeenFlagRequest,
    TicketEvent, LoadArticleZipAttachmentRequest,
} from '../core/model/';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '../core/common';
import { TicketService } from '../core/services';

export class TicketCommunicator extends KIXCommunicator {

    private static INSTANCE: TicketCommunicator;

    public static getInstance(): TicketCommunicator {
        if (!TicketCommunicator.INSTANCE) {
            TicketCommunicator.INSTANCE = new TicketCommunicator();
        }
        return TicketCommunicator.INSTANCE;
    }

    private constructor() {
        super();
    }

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
        const attachemnt = await TicketService.getInstance().loadArticleAttachment(
            data.token, data.ticketId, data.articleId, data.attachmentId
        );

        const response = new LoadArticleAttachmentResponse(data.requestId, attachemnt);
        return new CommunicatorResponse(TicketEvent.ARTICLE_ATTACHMENT_LOADED, response);
    }

    private async loadArticleZipAttachment(
        data: LoadArticleZipAttachmentRequest
    ): Promise<CommunicatorResponse<LoadArticleAttachmentResponse>> {
        const attachemnt = await TicketService.getInstance().loadArticleZipAttachment(
            data.token, data.ticketId, data.articleId
        );

        const response = new LoadArticleAttachmentResponse(data.requestId, attachemnt);
        return new CommunicatorResponse(TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED, response);
    }

    private async removeArticleSeenFlag(data: SetArticleSeenFlagRequest): Promise<CommunicatorResponse<void>> {
        await TicketService.getInstance().setArticleSeenFlag(data.token, data.ticketId, data.articleId);
        return new CommunicatorResponse(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE);
    }
}
