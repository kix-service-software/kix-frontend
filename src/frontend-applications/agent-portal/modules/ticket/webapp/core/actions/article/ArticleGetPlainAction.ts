/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { BrowserUtil } from '../../../../../../modules/base-components/webapp/core/BrowserUtil';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { Article } from '../../../../model/Article';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { Ticket } from '../../../../model/Ticket';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';

export class ArticleGetPlainAction extends AbstractAction {

    private articleId: number = null;

    public hasLink: boolean = true;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Source Message';
        this.icon = 'kix-icon-listview';
    }

    public async canShow(): Promise<boolean> {
        let show = false;
        const context = ContextService.getInstance().getActiveContext();
        const objectId = context ? context.getObjectId() : null;

        if (objectId && this.articleId) {
            const article = await this.getArticle(objectId);

            show = article && article.ChannelID === 2 && article.Plain && article.Plain !== '';
        }

        return show;
    }

    private async getArticle(objectId: string | number): Promise<Article> {
        const articles = await KIXObjectService.loadObjects<Article>(
            KIXObjectType.ARTICLE, [this.articleId],
            new KIXObjectLoadingOptions(
                null, null, null, [ArticleProperty.PLAIN]
            ),
            new ArticleLoadingOptions(objectId), true
        ).catch(() => [] as Article[]);

        return (articles && articles[0]) ? articles[0] : null;
    }

    public async setData(data: any): Promise<void> {
        super.setData(data);
        if (this.data) {
            if (Array.isArray(this.data)) {
                this.articleId = this.data[0].ArticleID;
            } else if (typeof this.data === 'string' || typeof this.data === 'number') {
                this.articleId = Number(this.data);
            } else if (typeof this.data === 'object' && this.data instanceof Article) {
                this.articleId = this.data.ArticleID;
            }
        }
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const context = ContextService.getInstance().getActiveContext();
            const objectId = context ? context.getObjectId() : null;

            if (objectId && this.articleId) {
                const article = await this.getArticle(objectId);
                if (article && article.Plain) {
                    const ticket = await context.getObject<Ticket>();
                    if (ticket) {
                        const ticketText = await LabelService.getInstance().getObjectText(ticket, true, false);
                        const fileName = ticketText + '_' + this.articleId + '.eml';
                        BrowserUtil.startBrowserDownload(fileName, article.Plain, 'message/rfc822', false);
                    }
                }
            }
        } else {
            super.run(event);
        }
    }

    public canRun(): boolean {
        return this.articleId !== null;
    }

    public async getLinkData(): Promise<string> {
        return this.articleId.toString();
    }
}
