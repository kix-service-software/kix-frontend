import { TicketService } from '../..';
import { Article, OverlayType, StringContent } from '../../../../model';
import { AbstractAction } from '../../../../model/components/action/AbstractAction';
import { BrowserUtil } from '../../../BrowserUtil';
import { OverlayService } from '../../../OverlayService';

export class ArticleZipAttachmentDownloadAction extends AbstractAction<Article> {

    public initAction(): void {
        this.text = "Download";
        this.icon = "kix-icon-download";
    }

    public async run(): Promise<void> {
        if (this.data) {
            const attachment = await TicketService.getInstance().loadArticleZipAttachment(
                this.data.TicketID, this.data.ArticleID
            );

            BrowserUtil.startBrowserDownload(attachment.Filename, attachment.Content, attachment.ContentType);
        } else {
            const error = 'Kein Artikel verfügbar!';
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true
            );
        }
    }

}
