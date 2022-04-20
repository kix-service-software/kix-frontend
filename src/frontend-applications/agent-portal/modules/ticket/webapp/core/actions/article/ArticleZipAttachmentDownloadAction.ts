/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { Article } from '../../../../model/Article';
import { TicketService } from '../..';
import { BrowserUtil } from '../../../../../../modules/base-components/webapp/core/BrowserUtil';
import { OverlayService } from '../../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../../modules/base-components/webapp/core/OverlayType';
import { StringContent } from '../../../../../../modules/base-components/webapp/core/StringContent';

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
                OverlayType.WARNING, null, new StringContent(error), 'Translatable#Error!', null, true
            );
        }
    }

}
