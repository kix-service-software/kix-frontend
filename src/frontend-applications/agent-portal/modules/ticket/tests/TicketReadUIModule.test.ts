/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { TicketHistoryTableFactory, TicketTableCSSHandler, ArticleTableCSSHandler, } from '../webapp/core';
import { UIModule as TicketReadUIModule } from '../webapp/core/TicketReadUIModule';
import { TicketTableFactory } from '../webapp/core/table/TicketTableFactory'
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ArticleTableFactory } from '../webapp/core/table/ArticleTableFactory';
import { TableCSSHandlerRegistry } from '../../table/webapp/core/css-handler/TableCSSHandlerRegistry';
import { TableFactoryService } from '../../table/webapp/core/factory/TableFactoryService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('TicketReadUIModule', () => {

    let ticketModule: TicketReadUIModule;

    before(() => {
        ticketModule = new TicketReadUIModule();
    });

    describe('Should register the read module for ticket', () => {

        it('should register', async () => {
            await ticketModule.register();
        });

        describe('Check contexts', () => {
            it('should register the context for TicketContext', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(TicketContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });

            it('should register the context for TicketDetailsContext', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(TicketDetailsContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });

            it('should register the context for TicketSearchContext', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(TicketSearchContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });

            it('should register the context for TicketListContext', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(TicketListContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });
        });

        describe('Check actions', () => {

            it('should register ArticleZipAttachmentDownloadAction', () => {
                expect(ActionFactory.getInstance().hasAction('article-attachment-zip-download')).true;
            });

            it('should register TicketSearchAction', () => {
                expect(ActionFactory.getInstance().hasAction('ticket-search-action')).true;
            });

            it('should register ShowUserTicketsAction', () => {
                expect(ActionFactory.getInstance().hasAction('show-user-tickets')).true;
            });

            it('should register TicketWatchAction', () => {
                expect(ActionFactory.getInstance().hasAction('ticket-watch-action')).true;
            });

            it('should register TicketLockAction', () => {
                expect(ActionFactory.getInstance().hasAction('ticket-lock-action')).true;
            });

            it('should register TicketPrintAction', () => {
                expect(ActionFactory.getInstance().hasAction('ticket-print-action')).true;
            });
        });

        describe('Check tables', () => {
            it('Should register the TicketTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.TICKET);
                expect(factory).exist;
                expect(factory).instanceof(TicketTableFactory);
            });

            it('Should register the ArticleTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.ARTICLE);
                expect(factory).exist;
                expect(factory).instanceof(ArticleTableFactory);
            });

            it('Should register the TicketHistoryTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.TICKET_HISTORY);
                expect(factory).exist;
                expect(factory).instanceof(TicketHistoryTableFactory);
            });

            it('Should register the TicketTableCSSHandler', () => {
                const handler = TableCSSHandlerRegistry.getObjectCSSHandler(KIXObjectType.TICKET);
                expect(handler).exist;
                expect(handler).an('array');
                expect(handler.length).equals(1);
                expect(handler[0]).instanceof(TicketTableCSSHandler);
            });

            it('Should register the ArticleTableCSSHandler', () => {
                const handler = TableCSSHandlerRegistry.getObjectCSSHandler(KIXObjectType.ARTICLE);
                expect(handler).exist;
                expect(handler).an('array');
                expect(handler.length).equals(1);
                expect(handler[0]).instanceof(ArticleTableCSSHandler);
            });

        });

    });

});
