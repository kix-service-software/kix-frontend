import {
    Attachment,
    LoadArticleZipAttachmentRequest, LoadArticleAttachmentRequest, LoadArticleAttachmentResponse,
    TicketEvent,
    SetArticleSeenFlagRequest,
    ISocketResponse,
    KIXObjectType
} from '../../model';

import { SocketClient } from '../SocketClient';
import { ClientStorageService } from '../ClientStorageService';
import { IdService } from '../IdService';
import { SocketErrorResponse } from '../../common';
import { CacheService } from '../cache';

export class TicketSocketClient extends SocketClient {

    public static getInstance(): TicketSocketClient {
        if (!TicketSocketClient.INSTANCE) {
            TicketSocketClient.INSTANCE = new TicketSocketClient();
        }

        return TicketSocketClient.INSTANCE;
    }

    private static INSTANCE: TicketSocketClient = null;

    public constructor() {
        super();
        this.socket = this.createSocket('tickets', true);
    }

    private requestPromises: Map<string, Promise<any>> = new Map();

    public async loadArticleAttachment(ticketId: number, articleId: number, attachmentId: number): Promise<Attachment> {

        const cacheKey = `${ticketId}-${articleId}-${attachmentId}`;

        if (await CacheService.getInstance().has(cacheKey, 'Ticket-Article-Attachment')) {
            return await CacheService.getInstance().get(cacheKey, 'Ticket-Article-Attachment');
        }

        if (this.requestPromises.has(cacheKey)) {
            return await this.requestPromises.get(cacheKey);
        }

        const requestPromise = new Promise<Attachment>((resolve, reject) => {
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

            this.socket.on(TicketEvent.LOAD_ARTICLE_ATTACHMENT_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    reject(error);
                }
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ATTACHMENT, request);
        });


        this.requestPromises.set(cacheKey, requestPromise);
        return await requestPromise;
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

            this.socket.on(TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    reject(error);
                }
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT, request);
        });
    }

    public setArticleSeenFlag(ticketId, articleId): Promise<void> {
        return new Promise((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();
            const request = new SetArticleSeenFlagRequest(
                token, requestId, ClientStorageService.getClientRequestId(), ticketId, articleId
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.REMOVE_ARTICLE_SEEN_FLAG);
            }, 30000);

            this.socket.on(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve();
                }
            });

            this.socket.emit(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, request);
        });
    }

}
