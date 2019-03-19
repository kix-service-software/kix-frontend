import {
    Ticket, TicketFactory, KIXObjectType, Customer, Contact, TicketHistory,
    Link, ObjectData, TicketPriority, TicketType, TicketState, StateType,
    Queue, DynamicField, Sla, KIXObjectLoadingOptions
} from '../../model';
import { IKIXObjectFactory, KIXObjectService } from '../kix';
import { ArticleBrowserFactory } from './ArticleBrowserFactory';
import { ObjectDataService } from '../ObjectDataService';

export class TicketBrowserFactory implements IKIXObjectFactory<Ticket> {

    private static INSTANCE: TicketBrowserFactory;

    public static getInstance(): TicketBrowserFactory {
        if (!TicketBrowserFactory.INSTANCE) {
            TicketBrowserFactory.INSTANCE = new TicketBrowserFactory();
        }
        return TicketBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(ticket: Ticket): Promise<Ticket> {
        const newTicket = TicketFactory.create(ticket);
        await this.mapTicketData(newTicket);
        return newTicket;
    }

    private async mapTicketData(ticket: Ticket): Promise<void> {
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            await this.initArticles(ticket);

            ticket.DynamicFields = ticket.DynamicFields ? ticket.DynamicFields.map((df) => new DynamicField(df)) : [];
            ticket.History = ticket.History ? ticket.History.map((th) => new TicketHistory(th)) : [];
            ticket.Links = ticket.Links ? ticket.Links.map((l) => new Link(l)) : [];
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
