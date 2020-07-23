/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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

class ArticleAttachmentComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.attachment = input.attachment;
        this.state.article = input.article;

        if (this.state.attachment) {
            this.state.icon = new ObjectIcon(null, 'MIMEType', this.state.attachment.ContentType);
        }
    }

    public async download(): Promise<void> {
        if (!this.state.progress && this.state.article && this.state.attachment) {
            this.state.progress = true;
            const attachment = await this.loadArticleAttachment(this.state.attachment.ID);
            this.state.progress = false;

            BrowserUtil.startBrowserDownload(attachment.Filename, attachment.Content, attachment.ContentType);
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
