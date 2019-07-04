import {
    LoadArticleAttachmentResponse, LoadArticleAttachmentRequest, SetArticleSeenFlagRequest,
    TicketEvent, LoadArticleZipAttachmentRequest, SocketEvent,
} from '../core/model/';

import { SocketNameSpace } from './SocketNameSpace';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { TicketService } from '../core/services';

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

    private async loadArticleAttachment(data: LoadArticleAttachmentRequest): Promise<SocketResponse> {
        const response = await TicketService.getInstance().loadArticleAttachment(
            data.token, data.ticketId, data.articleId, data.attachmentId
        ).then((attachment) =>
            new SocketResponse(
                TicketEvent.ARTICLE_ATTACHMENT_LOADED,
                new LoadArticleAttachmentResponse(data.requestId, attachment)
            )
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async loadArticleZipAttachment(data: LoadArticleZipAttachmentRequest): Promise<SocketResponse> {
        const response = await TicketService.getInstance().loadArticleZipAttachment(
            data.token, data.ticketId, data.articleId
        ).then((attachment) =>
            new SocketResponse(
                TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED,
                new LoadArticleAttachmentResponse(data.requestId, attachment)
            )
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async removeArticleSeenFlag(data: SetArticleSeenFlagRequest): Promise<SocketResponse> {
        const response = await TicketService.getInstance().setArticleSeenFlag(
            data.token, null, data.ticketId, data.articleId
        ).then(() =>
            new SocketResponse(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE, { requestId: data.requestId })
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }
}
