import { Ticket, TicketHistory, Link, DynamicField } from '../../model';
import { KIXObjectFactory } from '../kix';
import { ArticleBrowserFactory } from './ArticleBrowserFactory';

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
        const newTicket = new Ticket(ticket);
        await this.mapTicketData(newTicket);
        return newTicket;
    }

    private async mapTicketData(ticket: Ticket): Promise<void> {
        await this.initArticles(ticket);

        if (ticket.DynamicFields) {
            ticket.DynamicFields = ticket.DynamicFields.map((df) => new DynamicField(df));
        }

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
