import {
    Attachment,
    LoadArticleZipAttachmentRequest, LoadArticleAttachmentRequest, LoadArticleAttachmentResponse,
    TicketEvent,
    SetArticleSeenFlagRequest
} from '../../model';

import { SocketListener } from '../SocketListener';
import { ClientStorageService } from '../ClientStorageService';
import { SearchOperator } from '../SearchOperator';
import { IdService } from '../IdService';

export class TicketSocketListener extends SocketListener {

    public static getInstance(): TicketSocketListener {
        if (!TicketSocketListener.INSTANCE) {
            TicketSocketListener.INSTANCE = new TicketSocketListener();
        }

        return TicketSocketListener.INSTANCE;
    }

    private static INSTANCE: TicketSocketListener = null;

    public constructor() {
        super();
        this.socket = this.createSocket('tickets', true);
    }

    public loadArticleAttachment(ticketId: number, articleId: number, attachmentId: number): Promise<Attachment> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadArticleAttachmentRequest(token, requestId, ticketId, articleId, attachmentId);

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.LOAD_ARTICLE_ATTACHMENT);
            }, 30000);

            this.socket.on(TicketEvent.ARTICLE_ATTACHMENT_LOADED, (result: LoadArticleAttachmentResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.attachment);
                }
            });

            this.socket.on(TicketEvent.LOAD_ARTICLE_ATTACHMENT_ERROR, (error: any) => {
                window.clearTimeout(timeout);
                reject(error);
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ATTACHMENT, request);
        });
    }

    public loadArticleZipAttachment(ticketId: number, articleId: number): Promise<Attachment> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadArticleZipAttachmentRequest(token, requestId, ticketId, articleId);

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT);
            }, 300000);

            this.socket.on(TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED, (result: LoadArticleAttachmentResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.attachment);
                }
            });

            this.socket.on(TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT_ERROR, (error: any) => {
                window.clearTimeout(timeout);
                reject(error);
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT, request);
        });
    }

    public setArticleSeenFlag(ticketId, articleId): Promise<void> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const request = new SetArticleSeenFlagRequest(token, ticketId, articleId);

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.REMOVE_ARTICLE_SEEN_FLAG);
            }, 30000);

            this.socket.on(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE, () => {
                window.clearTimeout(timeout);
                resolve();
            });

            this.socket.emit(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, request);
        });
    }

}
