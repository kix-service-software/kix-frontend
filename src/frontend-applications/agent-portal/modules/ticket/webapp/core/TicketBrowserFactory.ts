/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ArticleBrowserFactory } from './ArticleBrowserFactory';
import { KIXObjectFactory } from '../../../../modules/base-components/webapp/core/KIXObjectFactory';
import { Ticket } from '../../model/Ticket';
import { TicketHistory } from '../../model/TicketHistory';
import { Link } from '../../../links/model/Link';

export class TicketBrowserFactory extends KIXObjectFactory<Ticket> {

    private static INSTANCE: TicketBrowserFactory;

    public static getInstance(): TicketBrowserFactory {
        if (!TicketBrowserFactory.INSTANCE) {
            TicketBrowserFactory.INSTANCE = new TicketBrowserFactory();
        }
        return TicketBrowserFactory.INSTANCE;
    }

    protected constructor() {
        super();
    }

    public async create(ticket: Ticket): Promise<Ticket> {
        let newTicket = new Ticket(ticket);

        if (this.objectConstructor && this.objectConstructor.length) {
            for (const objectConstructor of this.objectConstructor) {
                newTicket = new objectConstructor(newTicket);
            }
        }

        await this.mapTicketData(newTicket);

        return newTicket;
    }

    private async mapTicketData(ticket: Ticket): Promise<void> {
        await this.initArticles(ticket);

        if (ticket.History) {
            ticket.History = ticket.History.map((th) => new TicketHistory(th));
        }

        if (ticket.Links) {
            ticket.Links = ticket.Links.map((l) => new Link(l));
        }
    }

    private async initArticles(ticket: Ticket): Promise<void> {
        if (ticket.Articles) {
            const articles = [];
            for (const a of ticket.Articles) {
                const article = await ArticleBrowserFactory.getInstance().create(a);
                articles.push(article);
            }
            ticket.Articles = articles;
        }
    }


}
