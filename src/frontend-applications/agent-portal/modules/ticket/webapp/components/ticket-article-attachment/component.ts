/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';

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
            const contentTypeParts = this.state.attachment.ContentType.split(/;\s*/);
            const contentType = contentTypeParts[0];
            this.state.icon = new ObjectIcon(null, 'MIMEType', contentType);
        }
        this.images = Array.isArray(input.images) ? input.images : [];
    }

    public async download(force: boolean = false, event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        if (this.state.article && this.state.attachment) {

            if (!force && this.images && this.images.some((i) => i.imageId === this.state.attachment.ID)) {
                EventService.getInstance().publish(
                    ImageViewerEvent.OPEN_VIEWER,
                    new ImageViewerEventData(this.images, this.state.attachment.ID)
                );
            } else {
                EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                    loading: true, hint: 'Translatable#Prepare File Download'
                });
                const isPDF = this.state.attachment.ContentType === 'application/pdf';

                this.state.progress = true;
                const attachment = await this.loadArticleAttachment(this.state.attachment.ID, !isPDF);
                this.state.progress = false;

                if (isPDF) {
                    BrowserUtil.openPDF(attachment.Content, attachment.Filename);
                } else {
                    BrowserUtil.startFileDownload(attachment);
                }

                EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
            }
        }
    }

    private async loadArticleAttachment(attachmentId: number, asDownload: boolean): Promise<Attachment> {
        const attachment = await TicketService.getInstance().loadArticleAttachment(
            this.state.article.TicketID, this.state.article.ArticleID, attachmentId, asDownload
        );
        return attachment;
    }

}

module.exports = ArticleAttachmentComponent;
