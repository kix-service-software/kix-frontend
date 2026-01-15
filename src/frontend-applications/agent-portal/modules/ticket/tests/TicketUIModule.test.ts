/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { TicketSearchDefinition, TicketHistoryTableFactory, TicketTableCSSHandler, ArticleTableCSSHandler, TicketLabelProvider, QueueLabelProvider, TicketStateTypeLabelProvider, TicketStateLabelProvider, TicketPriorityLabelProvider, TicketTypeLabelProvider, TicketHistoryLabelProvider, ArticleLabelProvider, TicketService, QueueService, TicketPriorityService, TicketStateService, TicketTypeService, TicketFormService, ArticleFormService } from '../webapp/core';
import { UIModule as TicketUIModule } from '../webapp/core/TicketUIModule';
import { TicketTableFactory } from '../webapp/core/table/TicketTableFactory'
import { TicketPlaceholderHandler } from '../webapp/core/TicketPlaceholderHandler';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';
import { PlaceholderService } from '../../base-components/webapp/core/PlaceholderService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ArticleTableFactory } from '../webapp/core/table/ArticleTableFactory';
import { LabelService } from '../../base-components/webapp/core/LabelService';
import { ChannelLabelProvider } from '../webapp/core/ChannelLabelProvider';
import { ServiceRegistry } from '../../base-components/webapp/core/ServiceRegistry';
import { ChannelService } from '../webapp/core/ChannelService';
import { ServiceType } from '../../base-components/webapp/core/ServiceType';
import { TableCSSHandlerRegistry } from '../../table/webapp/core/css-handler/TableCSSHandlerRegistry';
import { TableFactoryService } from '../../table/webapp/core/factory/TableFactoryService';
import { SearchService } from '../../search/webapp/core/SearchService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('TicketUIModule', () => {

    let ticketModule: TicketUIModule;

    before(() => {
        ticketModule = new TicketUIModule();
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
