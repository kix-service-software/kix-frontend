/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { Attachment } from '../../../../../model/kix/Attachment';
import { DisplayImageDescription } from '../../../../base-components/webapp/core/DisplayImageDescription';
import { TicketService } from '../../core';

class TicketArticleAttchementListComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.article && input.article.Attachments) {
            this.state.article = input.article;
            const attachments: Attachment[] = input.article.Attachments;
            this.state.attachments = attachments.filter((a) => a.Disposition !== 'inline' || a.ContentID.length === 0 && !a.Filename.match(/^file-(1|2)$/));
            this.prepareImages();
        }
    }

    private async prepareImages(): Promise<void> {
        const attachmentPromises: Array<Promise<DisplayImageDescription>> = [];
        const imageAttachments = this.state.attachments.filter((a) => a.ContentType.match(/^image\//));
        if (imageAttachments && imageAttachments.length) {
            for (const imageAttachment of imageAttachments) {
                attachmentPromises.push(new Promise<DisplayImageDescription>(async (resolve, reject) => {
                    const attachment = await TicketService.getInstance().loadArticleAttachment(
                        this.state.article.TicketID, this.state.article.ArticleID, imageAttachment.ID
                    ).catch(() => null);

                    if (attachment) {
                        const content = `data:${attachment.ContentType};base64,${attachment.Content}`;
                        resolve(new DisplayImageDescription(
                            attachment.ID, content, attachment.Comment ? attachment.Comment : attachment.Filename
                        ));
                    } else {
                        resolve(null);
                    }
                }));
            }
        }
        this.state.images = (await Promise.all(attachmentPromises)).filter((i) => i);
    }
}

module.exports = TicketArticleAttchementListComponent;
