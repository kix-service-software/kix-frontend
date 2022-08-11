/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Article } from '../model/Article';
import { Ticket } from '../model/Ticket';
import { TicketProperty } from '../model/TicketProperty';
import { TicketObjectCommitHandler } from '../webapp/core/form/TicketObjectCommitHandler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ObjectCommitHandler', () => {

    describe('Remove all not relevant properties', () => {

        let ticket: Ticket;

        before(async () => {
            ticket = new Ticket();

            ticket.Articles = [];

            for (let i = 0; i < 3; i++) {
                const article = new Article(null, ticket);
                article.ChannelID = 1;
                ticket.Articles.push(article);
            }
            ticket.addBinding(TicketProperty.CONTACT_ID, () => null);
            ticket.addBinding(TicketProperty.TYPE_ID, () => null);
            ticket.addBinding(TicketProperty.STATE_ID, () => null);

            const commitHandler = new TicketObjectCommitHandler(null);
            ticket = await commitHandler.prepareObject(ticket);
        });

        it('should remove property bindings', () => {
            expect((ticket as any).propertyBindings).not.exist;
        });

        it('should remove displayValues', () => {
            expect(ticket.displayValues).not.exist;
        });

        it('should remove displayIcons', () => {
            expect(ticket.displayIcons).not.exist;
        });

        it('should remove ConfiguredPermissions', () => {
            expect(ticket.ConfiguredPermissions).not.exist;
        });

        it('should remove DynamicFields if array is empty', () => {
            expect(ticket.DynamicFields).not.exist;
        });

        it('articles should not have a ticket reference', () => {
            expect(ticket.Articles[0].ticket).not.exist;
            expect(ticket.Articles[1].ticket).not.exist;
            expect(ticket.Articles[2].ticket).not.exist;
        });

    });

    describe('Remove articles if no article with channel is defined', () => {
        let ticket: Ticket;

        before(async () => {
            ticket = new Ticket();

            ticket.Articles = [];

            for (let i = 0; i < 3; i++) {
                const article = new Article(null, ticket);
                ticket.Articles.push(article);
            }

            const commitHandler = new TicketObjectCommitHandler(null);
            ticket = await commitHandler.prepareObject(ticket);
        });

        it('Ticket should not have articles property', () => {
            expect(ticket.Articles).not.exist;
        });
    });

});