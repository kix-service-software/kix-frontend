/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketArticleDetailsComponentState } from './TicketArticleDetailsComponentState';
import {
    Article, Ticket, KIXObjectType, KIXObjectLoadingOptions, ArticleProperty, ArticleLoadingOptions
} from '../../../core/model';
import { KIXObjectService } from '../../../core/browser';

export class TicketArticleDetailsComponent {

    private state: TicketArticleDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketArticleDetailsComponentState();
    }

    public onInput(input: any): void {
        this.state.inputObject = input.article;
    }

    public async onMount(): Promise<void> {
        if (this.state.inputObject instanceof Article) {
            this.state.article = this.state.inputObject;
        } else if (this.state.inputObject instanceof Ticket) {
            const ticket = (this.state.inputObject as Ticket);
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, null,
                new KIXObjectLoadingOptions(null, 'Article.-ArticleID', 1, [ArticleProperty.ATTACHMENTS]),
                new ArticleLoadingOptions(ticket.TicketID)
            );

            if (articles && articles.length) {
                this.state.article = articles[0];
            }
        }

        this.state.loading = false;
    }
}

module.exports = TicketArticleDetailsComponent;
