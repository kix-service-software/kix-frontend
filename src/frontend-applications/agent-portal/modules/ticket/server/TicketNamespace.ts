/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { TicketEvent } from '../model/TicketEvent';
import { LoadArticleAttachmentRequest } from '../model/LoadArticleAttachmentRequest';
import { SocketResponse } from '../../../modules/base-components/webapp/core/SocketResponse';
import { LoadArticleAttachmentResponse } from '../model/LoadArticleAttachmentResponse';
import { SocketEvent } from '../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../modules/base-components/webapp/core/SocketErrorResponse';
import { LoadArticleZipAttachmentRequest } from '../model/LoadArticleZipAttachmentRequest';
import { SetArticleSeenFlagRequest } from '../model/SetArticleSeenFlagRequest';
import { TicketAPIService } from './TicketService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { CacheService } from '../../../server/services/cache';

import cookie from 'cookie';
import { Socket } from 'socket.io';
import { Attachment } from '../../../model/kix/Attachment';
import { UserService } from '../../user/server/UserService';
import { FileService } from '../../file/server/FileService';
import { RemoveArticleAttachmentDownloadsRequest } from '../model/RemoveArticleAttachmentDownloadsRequest';

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

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, TicketEvent.LOAD_ARTICLE_ATTACHMENT, this.loadArticleAttachment.bind(this));
        this.registerEventHandler(
            client, TicketEvent.REMOVE_ARTICLE_ATTACHMENT_DOWNLOADS, this.removeArticleAttachmentDownloads.bind(this)
        );
        this.registerEventHandler(
            client, TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT, this.loadArticleZipAttachment.bind(this)
        );
        this.registerEventHandler(client, TicketEvent.SET_ARTICLE_SEEN_FLAG, this.setArticleSeenFlag.bind(this));
    }

    private async loadArticleAttachment(
        data: LoadArticleAttachmentRequest, client: Socket
    ): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        const response = await TicketAPIService.getInstance().loadArticleAttachments(
            token, data.ticketId, data.articleId, data.attachmentIds, data.relevantOrganisationId,
            data.asDownload
        ).then((attachments: Attachment[]) =>
            new SocketResponse(
                TicketEvent.ARTICLE_ATTACHMENT_LOADED,
                new LoadArticleAttachmentResponse(data.requestId, attachments)
            )
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async removeArticleAttachmentDownloads(
        data: RemoveArticleAttachmentDownloadsRequest, client: Socket
    ): Promise<SocketResponse> {
        if (Array.isArray(data.downloadIds) && data.downloadIds.length) {
            const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
            const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
            const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';
            const user = await UserService.getInstance().getUserByToken(token);
            if (user?.UserID) {
                data.downloadIds?.forEach((di) => {
                    FileService.removeDownload(di, user?.UserID);
                });
            }
        }

        return new SocketResponse(
            TicketEvent.ARTICLE_ATTACHMENT_DOWNLOADS_REMOVED,
            new LoadArticleAttachmentResponse(data.requestId, null)
        );
    }

    private async loadArticleZipAttachment(
        data: LoadArticleZipAttachmentRequest, client: Socket
    ): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        const response = await TicketAPIService.getInstance().loadArticleZipAttachment(
            token, data.ticketId, data.articleId, data.relevantOrganisationId
        ).then((attachment) =>
            new SocketResponse(
                TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED,
                new LoadArticleAttachmentResponse(data.requestId, [attachment])
            )
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async setArticleSeenFlag(
        data: SetArticleSeenFlagRequest, client: Socket
    ): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        const response = await TicketAPIService.getInstance().setArticleSeenFlag(
            token, null, data.ticketId, data.articleId
        ).then(() =>
            new SocketResponse(TicketEvent.SET_ARTICLE_SEEN_FLAG_DONE, { requestId: data.requestId })
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        CacheService.getInstance().deleteKeys(KIXObjectType.TICKET);

        return response;
    }
}
