// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { KIXObjectCache, KIXObjectType, Ticket, Contact, Customer, ConfigItem, KIXObject } from '../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('KIXObject Cache', () => {

    before(() => {
        for (let i = 0; i < 10; i++) {
            KIXObjectCache.addObject(KIXObjectType.TICKET, createTicket(i))
        }
    });

    it('Should contain tickets in cache after add.', () => {
        expect(KIXObjectCache.hasObjectCache(KIXObjectType.TICKET)).true;
        expect(KIXObjectCache.getObjectCache(KIXObjectType.TICKET).length).equals(10);
    });

    it('Should retrieve ticket from cache.', () => {
        const ticketId = 98765;
        KIXObjectCache.addObject(KIXObjectType.TICKET, createTicket(ticketId));
        const cachedTicket = KIXObjectCache.getObject(KIXObjectType.TICKET, ticketId);
        expect(cachedTicket).not.undefined;
        expect(cachedTicket.ObjectId).equals(ticketId);
    });

    it('Should retrieve multiple tickets from cache.', () => {
        const cachedTickets = KIXObjectCache.getCachedObjects(KIXObjectType.TICKET, [3, 6, 8]);
        expect(cachedTickets).not.undefined;
        expect(cachedTickets.length).equals(3);
        expect(cachedTickets[0].ObjectId).equals(3);
        expect(cachedTickets[1].ObjectId).equals(6);
        expect(cachedTickets[2].ObjectId).equals(8);
    });

    it('Should return empty list for unknown cache object type.', () => {
        const slas = KIXObjectCache.getObjectCache(KIXObjectType.SLA);
        expect(slas).not.undefined;
        expect(slas.length).equals(0);
    });

    it('Should remove object from cache.', () => {
        const ticketId = 54321;
        KIXObjectCache.addObject(KIXObjectType.TICKET, createTicket(ticketId));
        expect(KIXObjectCache.getObject(KIXObjectType.TICKET, ticketId)).not.undefined;

        KIXObjectCache.removeObject(KIXObjectType.TICKET, ticketId);
        expect(KIXObjectCache.getObject(KIXObjectType.TICKET, ticketId)).undefined;
    });

    it('Should clear cache for objecttype.', () => {
        const ticketId = 54321;
        KIXObjectCache.addObject(KIXObjectType.TICKET, createTicket(ticketId));
        expect(KIXObjectCache.getObject(KIXObjectType.TICKET, ticketId)).not.undefined;

        KIXObjectCache.clearCache(KIXObjectType.TICKET);
        expect(KIXObjectCache.hasObjectCache(KIXObjectType.TICKET)).false;
        expect(KIXObjectCache.getObjectCache(KIXObjectType.TICKET)).not.undefined;
        expect(KIXObjectCache.getObjectCache(KIXObjectType.TICKET).length).equals(0);
    });

    after(() => {
        KIXObjectCache.clearCache(KIXObjectType.TICKET);
    });
});

function createTicket(id: number): Ticket {
    const ticket = new Ticket();
    ticket.ObjectId = id;
    ticket.TicketID = id;
    return ticket;
}
