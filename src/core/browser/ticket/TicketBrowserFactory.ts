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

            ticket.owner = objectData.users.find((u) => u.UserID === ticket.OwnerID);
            ticket.responsible = objectData.users.find((u) => u.UserID === ticket.ResponsibleID);
            ticket.service = objectData.services.find((s) => s.ServiceID === ticket.ServiceID);

            await this.initQueue(ticket);
            await this.initPriority(ticket);
            await this.initType(ticket);
            await this.initState(ticket, objectData);
            await this.initCustomer(ticket);
            await this.initContact(ticket);
            await this.initArticles(ticket);
            await this.initSla(ticket);

            ticket.DynamicFields = ticket.DynamicFields ? ticket.DynamicFields.map((df) => new DynamicField(df)) : [];
            ticket.History = ticket.History ? ticket.History.map((th) => new TicketHistory(th)) : [];
            ticket.Links = ticket.Links ? ticket.Links.map((l) => new Link(l)) : [];
        }
    }

    private async initQueue(ticket: Ticket): Promise<void> {
        const queues = await KIXObjectService.loadObjects<Queue>(
            KIXObjectType.QUEUE, [ticket.QueueID]
        ).catch((error) => [] as Queue[]);

        if (queues && queues.length) {
            ticket.queue = queues.find((q) => q.QueueID === ticket.QueueID);
        }
    }

    private async initPriority(ticket: Ticket): Promise<void> {
        const priorities = await KIXObjectService.loadObjects<TicketPriority>(
            KIXObjectType.TICKET_PRIORITY, [ticket.PriorityID]
        ).catch((error) => []);

        if (priorities && priorities.length) {
            ticket.priority = priorities[0];
        }
    }
    private async initType(ticket: Ticket): Promise<void> {
        const types = await KIXObjectService.loadObjects<TicketType>(
            KIXObjectType.TICKET_TYPE, [ticket.TypeID]
        ).catch((error) => []);

        if (types && types.length) {
            ticket.type = types[0];
        }
    }

    private async initSla(ticket: Ticket): Promise<void> {
        if (ticket.SLAID) {
            const slas = await KIXObjectService.loadObjects<Sla>(
                KIXObjectType.SLA, [ticket.SLAID]
            ).catch((error) => []);

            if (slas && slas.length) {
                ticket.sla = slas[0];
            }
        }
    }

    private async initState(ticket: Ticket, objectData: ObjectData): Promise<void> {
        const states = await KIXObjectService.loadObjects<TicketState>(
            KIXObjectType.TICKET_STATE, [ticket.StateID]
        ).catch((error) => []);

        if (states && states.length) {
            ticket.state = states[0];
            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, [ticket.state.TypeID]
            ).catch((error) => []);
            if (stateTypes && stateTypes.length) {
                ticket.stateType = stateTypes[0];
            }

        }
    }

    private async initCustomer(ticket: Ticket): Promise<void> {
        if (ticket.CustomerID) {
            const customers = await KIXObjectService.loadObjects<Customer>(
                KIXObjectType.CUSTOMER, [ticket.CustomerID]
            ).catch((error) => []);
            if (customers && customers.length) {
                ticket.customer = customers[0];
            }
        }
    }

    private async initContact(ticket: Ticket): Promise<void> {
        if (ticket.CustomerUserID) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, null, null, ['Tickets', 'TicketStats']
            );
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [ticket.CustomerUserID], loadingOptions
            ).catch((error) => []);
            if (contacts && contacts.length) {
                ticket.contact = contacts[0];
            }
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
