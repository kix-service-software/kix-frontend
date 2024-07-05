/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../../../../modules/base-components/webapp/core/SocketClient';
import { Attachment } from '../../../../model/kix/Attachment';
import { ClientStorageService } from '../../../../modules/base-components/webapp/core/ClientStorageService';
import { IdService } from '../../../../model/IdService';
import { SocketEvent } from '../../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../../modules/base-components/webapp/core/SocketErrorResponse';
import { ISocketResponse } from '../../../../modules/base-components/webapp/core/ISocketResponse';
import { LoadArticleAttachmentRequest } from '../../model/LoadArticleAttachmentRequest';
import { TicketEvent } from '../../model/TicketEvent';
import { LoadArticleAttachmentResponse } from '../../model/LoadArticleAttachmentResponse';
import { LoadArticleZipAttachmentRequest } from '../../model/LoadArticleZipAttachmentRequest';
import { SetArticleSeenFlagRequest } from '../../model/SetArticleSeenFlagRequest';
import { BrowserCacheService } from '../../../../modules/base-components/webapp/core/CacheService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class TicketSocketClient extends SocketClient {

    public static getInstance(): TicketSocketClient {
        if (!TicketSocketClient.INSTANCE) {
            TicketSocketClient.INSTANCE = new TicketSocketClient();
        }

        return TicketSocketClient.INSTANCE;
    }

    private static INSTANCE: TicketSocketClient = null;

    public constructor() {
        super('tickets');
    }

    public async loadArticleAttachment(
        ticketId: number, articleId: number, attachmentId: number, asDownload?: boolean
    ): Promise<Attachment> {
        this.checkSocketConnection();

        const cacheKey = `${ticketId}-${articleId}-${attachmentId}`;

        if (!asDownload && BrowserCacheService.getInstance().has(cacheKey, KIXObjectType.ATTACHMENT)) {
            return BrowserCacheService.getInstance().get(cacheKey, KIXObjectType.ATTACHMENT);
        }

        const socketTimeout = ClientStorageService.getSocketTimeout();

        const requestPromise = new Promise<Attachment>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const organisationId = ClientStorageService.getOption('RelevantOrganisationID');
            const request = new LoadArticleAttachmentRequest(
                requestId, ticketId, articleId, [attachmentId], Number(organisationId), asDownload
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.LOAD_ARTICLE_ATTACHMENT);
            }, socketTimeout);

            this.socket.on(TicketEvent.ARTICLE_ATTACHMENT_LOADED, (result: LoadArticleAttachmentResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(new Attachment(result.attachments[0]));
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error);
                }
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ATTACHMENT, request);
        });

        BrowserCacheService.getInstance().set(cacheKey, requestPromise, KIXObjectType.ATTACHMENT);
        return await requestPromise;
    }

    public async loadArticleZipAttachment(ticketId: number, articleId: number): Promise<Attachment> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<Attachment>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const organisationId = ClientStorageService.getOption('RelevantOrganisationID');
            const request = new LoadArticleZipAttachmentRequest(
                requestId, ticketId, articleId, Number(organisationId)
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT);
            }, socketTimeout);

            this.socket.on(TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED, (result: LoadArticleAttachmentResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.attachments[0]);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT, request);
        });
    }

    public async loadArticleAttachments(
        ticketId: number, articleId: number, attachmentIds: number[]
    ): Promise<Attachment[]> {
        this.checkSocketConnection();

        const cacheKey = `${ticketId}-${articleId}-${attachmentIds.join(',')}`;

        if (BrowserCacheService.getInstance().has(cacheKey, KIXObjectType.ATTACHMENT)) {
            return BrowserCacheService.getInstance().get(cacheKey, KIXObjectType.ATTACHMENT);
        }

        const socketTimeout = ClientStorageService.getSocketTimeout();

        const requestPromise = new Promise<Attachment[]>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const organisationId = ClientStorageService.getOption('RelevantOrganisationID');
            const request = new LoadArticleAttachmentRequest(
                requestId, ticketId, articleId, attachmentIds, Number(organisationId)
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.LOAD_ARTICLE_ATTACHMENT);
            }, socketTimeout);

            this.socket.on(TicketEvent.ARTICLE_ATTACHMENT_LOADED, (result: LoadArticleAttachmentResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.attachments.map((a) => new Attachment(a)));
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error);
                }
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ATTACHMENT, request);
        });

        BrowserCacheService.getInstance().set(cacheKey, requestPromise, KIXObjectType.ATTACHMENT);
        return await requestPromise;
    }


    public async setArticleSeenFlag(ticketId, articleId): Promise<void> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const request = new SetArticleSeenFlagRequest(
                requestId, ClientStorageService.getClientRequestId(), ticketId, articleId
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.SET_ARTICLE_SEEN_FLAG);
            }, socketTimeout);

            this.socket.on(TicketEvent.SET_ARTICLE_SEEN_FLAG_DONE, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
                    BrowserCacheService.getInstance().deleteKeys(KIXObjectType.TICKET);
                    window.clearTimeout(timeout);
                    resolve();
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(TicketEvent.SET_ARTICLE_SEEN_FLAG, request);
        });
    }

}
