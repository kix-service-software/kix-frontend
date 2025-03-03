/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { Article } from '../model/Article';
import { Channel } from '../model/Channel';
import { Queue } from '../model/Queue';
import { Ticket } from '../model/Ticket';
import { TicketProperty } from '../model/TicketProperty';
import { TicketObjectCommitHandler } from '../webapp/core/form/TicketObjectCommitHandler';
import { TicketService } from '../webapp/core';
import { TicketModuleConfiguration } from '../model/TicketModuleConfiguration';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ObjectCommitHandler', () => {

    const ticketModuleConfig = new TicketModuleConfiguration()

    let originalMethod;

    before(() => {
        originalMethod = TicketService.getTicketModuleConfiguration;
        TicketService.getTicketModuleConfiguration = async (): Promise<TicketModuleConfiguration> => ticketModuleConfig;
    });

    after(() => {
        TicketService.getTicketModuleConfiguration = originalMethod;
    });

    describe('Remove all not relevant properties', () => {

        let ticket: Ticket;

        before(async () => {
            ticket = new Ticket();

            ticket.addBinding(TicketProperty.CONTACT_ID, () => null);
            ticket.addBinding(TicketProperty.TYPE_ID, () => null);
            ticket.addBinding(TicketProperty.STATE_ID, () => null);

            const commitHandler = new TicketObjectCommitHandler(null);
            ticket = await commitHandler.prepareObject(ticket);

            ticket.Articles = [];
            for (let i = 0; i < 3; i++) {
                const article = new Article(null, ticket);
                article.ChannelID = 1;
                ticket.Articles.push(article);
            }
            for (const article of ticket.Articles) {
                await commitHandler.prepareArticle(ticket, article, false, null, null);
            }
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

    describe('Add queue signature to email article', () => {
        let ticket: Ticket;
        let orgLoadObjectsFunction: any;
        const signature: string = '<p>This is the signature</p>';
        const testRegex: RegExp = new RegExp(`.*${signature}.*`);

        before(async () => {
            orgLoadObjectsFunction = KIXObjectService.loadObjects;
            KIXObjectService.loadObjects = async <T>(objectType: KIXObjectType | string, objectIds?: Array<number | string>): Promise<T> => {
                let objects;
                if (objectType === KIXObjectType.CHANNEL) {
                    const isEmail = objectIds && objectIds[0] === 2;
                    objects = [
                        new Channel({
                            ID: isEmail ? 2 : 1,
                            Name: isEmail ? "email" : 'note'
                        } as Channel)
                    ];
                } else if (objectType === KIXObjectType.QUEUE) {
                    objects = [
                        new Queue({
                            QueueID: 1,
                            Name: 'Test team', Fullname: 'Test team',
                            Signature: signature
                        } as Queue)
                    ];
                }
                return objects;
            };

            ticket = new Ticket();
            ticket.QueueID = 1;

            const emailArticle = new Article(null, ticket);
            emailArticle.ChannelID = 2;
            emailArticle.Body = 'test body';
            const noteArticle = new Article(null, ticket);
            noteArticle.ChannelID = 1;
            noteArticle.Body = 'test body';
            ticket.Articles = [emailArticle, noteArticle];

            const commitHandler = new TicketObjectCommitHandler(null);
            for (const article of ticket.Articles) {
                await commitHandler.prepareArticle(ticket, article, true, null, null);
            }
        });

        it('Ticket should have one article with a signature and one without', () => {
            expect(ticket.Articles).exist;
            expect(Array.isArray(ticket.Articles), 'Ticket should have some 2 articles').true;

            expect(ticket.Articles[0].ChannelID).equal(2);
            expect(Boolean(ticket.Articles[0].Body.match(testRegex)), 'First article (email) should have the signature attached').true;

            expect(ticket.Articles[1].ChannelID).equal(1);
            expect(Boolean(ticket.Articles[1].Body.match(testRegex)), 'Second article (note) should NOT have the signature attached').false;
        });

        after(() => {
            KIXObjectService.loadObjects = orgLoadObjectsFunction;
        })
    });

    describe('Do not add queue signature if not enabled', () => {
        let ticket: Ticket;
        let orgLoadObjectsFunction: any;
        const signature: string = '<p>This is the signature</p>';
        const testRegex: RegExp = new RegExp(`.*${signature}.*`);

        before(async () => {
            ticketModuleConfig.addQueueSignature = false;

            orgLoadObjectsFunction = KIXObjectService.loadObjects;
            KIXObjectService.loadObjects = async <T>(objectType: KIXObjectType | string, objectIds?: Array<number | string>): Promise<T> => {
                let objects;
                if (objectType === KIXObjectType.CHANNEL) {
                    const isEmail = objectIds && objectIds[0] === 2;
                    objects = [
                        new Channel({
                            ID: isEmail ? 2 : 1,
                            Name: isEmail ? "email" : 'note'
                        } as Channel)
                    ];
                } else if (objectType === KIXObjectType.QUEUE) {
                    objects = [
                        new Queue({
                            QueueID: 1,
                            Name: 'Test team', Fullname: 'Test team',
                            Signature: signature
                        } as Queue)
                    ];
                }
                return objects;
            };

            ticket = new Ticket();
            ticket.QueueID = 1;

            const emailArticle = new Article(null, ticket);
            emailArticle.ChannelID = 2;
            emailArticle.Body = 'test body';
            const noteArticle = new Article(null, ticket);
            noteArticle.ChannelID = 1;
            noteArticle.Body = 'test body';
            ticket.Articles = [emailArticle, noteArticle];

            const commitHandler = new TicketObjectCommitHandler(null);
            for (const article of ticket.Articles) {
                await commitHandler.prepareArticle(ticket, article, true, null, null);
            }
        });

        it('Ticket should have two articles without a signature', () => {
            expect(ticket.Articles).exist;
            expect(Array.isArray(ticket.Articles), 'Ticket should have two articles').true;

            expect(ticket.Articles[0].ChannelID).equal(2);
            expect(Boolean(ticket.Articles[0].Body.match(testRegex)), 'First article (email) should NOT have the signature attached').false;

            expect(ticket.Articles[1].ChannelID).equal(1);
            expect(Boolean(ticket.Articles[1].Body.match(testRegex)), 'Second article (note) should NOT have the signature attached').false;
        });

        after(() => {
            KIXObjectService.loadObjects = orgLoadObjectsFunction;
        })
    });

});