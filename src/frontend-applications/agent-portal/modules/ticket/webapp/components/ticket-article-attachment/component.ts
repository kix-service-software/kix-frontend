/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { Attachment } from '../../../../../model/kix/Attachment';
import { TicketService } from '../../core';
import { DisplayImageDescription } from '../../../../base-components/webapp/core/DisplayImageDescription';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ImageViewerEvent } from '../../../../agent-portal/model/ImageViewerEvent';
import { ImageViewerEventData } from '../../../../agent-portal/model/ImageViewerEventData';

class ArticleAttachmentComponent {

    private state: ComponentState;
    private images: DisplayImageDescription[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.attachment = input.attachment;
        this.state.article = input.article;

        if (this.state.attachment) {
            this.state.icon = new ObjectIcon(null, 'MIMEType', this.state.attachment.ContentType);
        }
        this.images = Array.isArray(input.images) ? input.images : [];
    }

    public async download(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        if (this.state.article && this.state.attachment) {

            if (this.images && this.images.some((i) => i.imageId === this.state.attachment.ID)) {
                EventService.getInstance().publish(
                    ImageViewerEvent.OPEN_VIEWER,
                    new ImageViewerEventData(this.images, this.state.attachment.ID)
                );
            } else {
                this.state.progress = true;
                const attachment = await this.loadArticleAttachment(this.state.attachment.ID);
                this.state.progress = false;

                if (attachment.ContentType === 'application/pdf') {
                    BrowserUtil.openPDF(attachment.Content, attachment.Filename);
                } else {
                    BrowserUtil.startBrowserDownload(attachment.Filename, attachment.Content, attachment.ContentType);
                }
            }
        }
    }

    private async loadArticleAttachment(attachmentId: number): Promise<Attachment> {
        const attachment = await TicketService.getInstance().loadArticleAttachment(
            this.state.article.TicketID, this.state.article.ArticleID, attachmentId
        );
        return attachment;
    }

}

module.exports = ArticleAttachmentComponent;
