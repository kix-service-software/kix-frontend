/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketService } from '../..';
import { Article, OverlayType, StringContent } from '../../../../model';
import { AbstractAction } from '../../../../model/components/action/AbstractAction';
import { BrowserUtil } from '../../../BrowserUtil';
import { OverlayService } from '../../../OverlayService';

export class ArticleZipAttachmentDownloadAction extends AbstractAction<Article> {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Download';
        this.icon = 'kix-icon-download';
    }

    public async run(): Promise<void> {
        if (this.data) {
            const attachment = await TicketService.getInstance().loadArticleZipAttachment(
                this.data.TicketID, this.data.ArticleID
            );

            BrowserUtil.startBrowserDownload(attachment.Filename, attachment.Content, attachment.ContentType);
        } else {
            const error = 'Translatable#No article available.';
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, new StringContent(error), 'Translatable#Error!', true
            );
        }
    }

}
