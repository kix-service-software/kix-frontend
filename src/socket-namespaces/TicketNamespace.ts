import {
    LoadArticleAttachmentResponse, LoadArticleAttachmentRequest, SetArticleSeenFlagRequest,
    TicketEvent, LoadArticleZipAttachmentRequest,
} from '../core/model/';

import { SocketNameSpace } from './SocketNameSpace';
import { SocketResponse } from '../core/common';
import { TicketService } from '../core/services';
import { ClientStorageService } from '../core/browser';

export class TicketNamespace extends SocketNameSpace {

    private static INSTANCE: TicketNamespace;

    public static getInstance(): TicketNamespace {
        if (!TicketNamespace.INSTANCE) {
            TicketNamespace.INSTANCE = new TicketNamespace();
        }
        return TicketNamespace.INSTANCE;
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
    ): Promise<SocketResponse<LoadArticleAttachmentResponse>> {
        const attachemnt = await TicketService.getInstance().loadArticleAttachment(
            data.token, data.ticketId, data.articleId, data.attachmentId
        );

        const response = new LoadArticleAttachmentResponse(data.requestId, attachemnt);
        return new SocketResponse(TicketEvent.ARTICLE_ATTACHMENT_LOADED, response);
    }

    private async loadArticleZipAttachment(
        data: LoadArticleZipAttachmentRequest
    ): Promise<SocketResponse<LoadArticleAttachmentResponse>> {
        const attachemnt = await TicketService.getInstance().loadArticleZipAttachment(
            data.token, data.ticketId, data.articleId
        );

        const response = new LoadArticleAttachmentResponse(data.requestId, attachemnt);
        return new SocketResponse(TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED, response);
    }

    private async removeArticleSeenFlag(data: SetArticleSeenFlagRequest): Promise<SocketResponse<void>> {
        await TicketService.getInstance().setArticleSeenFlag(
            data.token, null, data.ticketId, data.articleId
        );
        return new SocketResponse(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE, { requestId: data.requestId });
    }
}
