/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { BrowserUtil } from '../../../../../../modules/base-components/webapp/core/BrowserUtil';
import { Article } from '../../../../model/Article';
import { Ticket } from '../../../../model/Ticket';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';

export class ArticleGetPlainAction extends AbstractAction<Article> {

    private articleId: number = null;

    public hasLink: boolean = true;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Source Message';
        this.icon = 'kix-icon-listview';
    }

    public async setData(data: Article): Promise<void> {
        super.setData(data);
        this.articleId = this.data?.ArticleID;
    }

    public async canShow(): Promise<boolean> {
        let show = false;
        const context = ContextService.getInstance().getActiveContext();
        const objectId = context ? context.getObjectId() : null;

        if (objectId && this.articleId) {
            show = this.data.ChannelID === 2 && this.data.Plain && this.data.Plain !== '';
        }

        return show;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const context = ContextService.getInstance().getActiveContext();
            const objectId = context ? context.getObjectId() : null;

            if (objectId && this.articleId) {
                if (this.data?.Plain) {
                    const ticket = await context.getObject<Ticket>();
                    if (ticket) {
                        const ticketText = await LabelService.getInstance().getObjectText(ticket, true, false);
                        const fileName = ticketText + '_' + this.articleId + '.eml';
                        BrowserUtil.startBrowserDownload(fileName, this.data.Plain, 'message/rfc822', false);
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
