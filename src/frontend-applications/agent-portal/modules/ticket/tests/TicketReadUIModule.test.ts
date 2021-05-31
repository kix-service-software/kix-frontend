/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { TicketSearchDefinition, TicketHistoryTableFactory, TicketTableCSSHandler, ArticleTableCSSHandler, TicketLabelProvider, QueueLabelProvider, TicketStateTypeLabelProvider, TicketStateLabelProvider, TicketPriorityLabelProvider, TicketTypeLabelProvider, TicketHistoryLabelProvider, ArticleLabelProvider, TicketService, QueueService, TicketPriorityService, TicketStateService, TicketTypeService, TicketFormService, ArticleFormService } from '../webapp/core';
import { UIModule as TicketReadUIModule } from '../webapp/core/TicketReadUIModule';
import { TicketTableFactory } from '../webapp/core/table/TicketTableFactory'
import { TicketPlaceholderHandler } from '../webapp/core/TicketPlaceholderHandler';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';
import { PlaceholderService } from '../../base-components/webapp/core/PlaceholderService';
import { SearchService } from '../../search/webapp/core';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { TableFactoryService, TableCSSHandlerRegistry } from '../../base-components/webapp/core/table';
import { ArticleTableFactory } from '../webapp/core/table/ArticleTableFactory';
import { LabelService } from '../../base-components/webapp/core/LabelService';
import { ChannelLabelProvider } from '../webapp/core/ChannelLabelProvider';
import { ServiceRegistry } from '../../base-components/webapp/core/ServiceRegistry';
import { ChannelService } from '../webapp/core/ChannelService';
import { ServiceType } from '../../base-components/webapp/core/ServiceType';

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

        describe('check services', () => {
            it('Should register the TicketService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.TICKET);
                expect(service).exist;
                expect(service).instanceof(TicketService);
            });

            it('Should register the TicketTypeService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.TICKET_TYPE);
                expect(service).exist;
                expect(service).instanceof(TicketTypeService);
            });

            it('Should register the TicketStateService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.TICKET_STATE);
                expect(service).exist;
                expect(service).instanceof(TicketStateService);
            });

            it('Should register the TicketPriorityService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.TICKET_PRIORITY);
                expect(service).exist;
                expect(service).instanceof(TicketPriorityService);
            });

            it('Should register the QueueService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.QUEUE);
                expect(service).exist;
                expect(service).instanceof(QueueService);
            });

            it('Should register the ChannelService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.CHANNEL);
                expect(service).exist;
                expect(service).instanceof(ChannelService);
            });

            it('Should register the TicketFormService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.TICKET, ServiceType.FORM);
                expect(service).exist;
                expect(service).instanceof(TicketFormService);
            });

            it('Should register the ArticleFormService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.ARTICLE, ServiceType.FORM);
                expect(service).exist;
                expect(service).instanceof(ArticleFormService);
            });

        });

        describe('check LabelServices', () => {

            it('Should register the TicketLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET);
                expect(provider).exist;
                expect(provider).instanceof(TicketLabelProvider);
            });

            it('Should register the ArticleLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.ARTICLE);
                expect(provider).exist;
                expect(provider).instanceof(ArticleLabelProvider);
            });

            it('Should register the TicketHistoryLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET_HISTORY);
                expect(provider).exist;
                expect(provider).instanceof(TicketHistoryLabelProvider);
            });

            it('Should register the TicketTypeLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET_TYPE);
                expect(provider).exist;
                expect(provider).instanceof(TicketTypeLabelProvider);
            });

            it('Should register the TicketPriorityLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET_PRIORITY);
                expect(provider).exist;
                expect(provider).instanceof(TicketPriorityLabelProvider);
            });

            it('Should register the TicketStateLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET_STATE);
                expect(provider).exist;
                expect(provider).instanceof(TicketStateLabelProvider);
            });

            it('Should register the TicketStateTypeLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET_STATE_TYPE);
                expect(provider).exist;
                expect(provider).instanceof(TicketStateTypeLabelProvider);
            });

            it('Should register the ChannelLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CHANNEL);
                expect(provider).exist;
                expect(provider).instanceof(ChannelLabelProvider);
            });

            it('Should register the QueueLabelProvider', () => {
                const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.QUEUE);
                expect(provider).exist;
                expect(provider).instanceof(QueueLabelProvider);
            });
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

        it('Should register the TicketSearchDefinition', () => {
            const definition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
            expect(definition).exist;
            expect(definition).instanceof(TicketSearchDefinition);
        });

        it('Should register the TicketPlaceholderHandler', () => {
            const handler = PlaceholderService.getInstance().getHandler('TICKET');
            expect(handler).exist;
            expect(handler).instanceof(TicketPlaceholderHandler);
        });
    });

});
