/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import {
    TicketService, TicketTypeService, TicketStateService,
    TicketPriorityService, QueueService, TicketFormService, ArticleFormService, PendingTimeValidator,
    EmailRecipientValidator, TicketSearchDefinition, TicketHistoryLabelProvider, TicketTypeLabelProvider,
    TicketPriorityLabelProvider, TicketStateLabelProvider, TicketStateTypeLabelProvider, QueueLabelProvider,
    TicketTableCSSHandler, ArticleTableCSSHandler,
    ArticleZipAttachmentDownloadAction, TicketSearchAction, ShowUserTicketsAction,
    TicketWatchAction, TicketLockAction, TicketContext, TicketDetailsContext, TicketSearchContext, TicketListContext
} from '.';
import { TicketTableFactory } from './table/TicketTableFactory';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { FormValidationService } from '../../../../modules/base-components/webapp/core/FormValidationService';
import { SearchService } from '../../../search/webapp/core';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { TableFactoryService, TableCSSHandlerRegistry } from '../../../base-components/webapp/core/table';
import { ArticleTableFactory } from './table/ArticleTableFactory';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ChannelLabelProvider } from './ChannelLabelProvider';
import { ArticleLabelProvider } from './ArticleLabelProvider';
import { TicketLabelProvider } from './TicketLabelProvider';
import { ChannelService } from './ChannelService';
import { TicketPlaceholderHandler } from './TicketPlaceholderHandler';
import { TicketPrintAction } from './actions/TicketPrintAction';
import { TicketsForAssetsHandler } from './TicketsForAssetsHandler';
import { SuggestedFAQHandler } from './SuggestedFAQHandler';
import { TicketHistoryTableFactory } from './table';
import { FormService } from '../../../base-components/webapp/core/FormService';
import { TicketFormFieldValueHandler } from './TicketFormFieldValueHandler';

export class UIModule implements IUIModule {

    public name: string = 'TicketReadUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 100;

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(TicketPlaceholderHandler.getInstance());

        ServiceRegistry.registerServiceInstance(TicketService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketTypeService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityService.getInstance());
        ServiceRegistry.registerServiceInstance(QueueService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        ServiceRegistry.registerServiceInstance(ArticleFormService.getInstance());
        ServiceRegistry.registerServiceInstance(ChannelService.getInstance());

        FormValidationService.getInstance().registerValidator(new PendingTimeValidator());
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        SearchService.getInstance().registerSearchDefinition(new TicketSearchDefinition());

        LabelService.getInstance().registerLabelProvider(new TicketLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ArticleLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketHistoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketPriorityLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ChannelLabelProvider());
        LabelService.getInstance().registerLabelProvider(new QueueLabelProvider());

        TableFactoryService.getInstance().registerFactory(new TicketTableFactory());
        TableFactoryService.getInstance().registerFactory(new ArticleTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketHistoryTableFactory());

        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.TICKET, new TicketTableCSSHandler()
        );
        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.ARTICLE, new ArticleTableCSSHandler()
        );

        ServiceRegistry.registerObjectReferenceHandler('TicketsForAssetsHandler', new TicketsForAssetsHandler());
        ServiceRegistry.registerObjectReferenceHandler('SuggestedFAQHandler', new SuggestedFAQHandler());

        FormService.getInstance().addFormFieldValueHandler(KIXObjectType.TICKET, new TicketFormFieldValueHandler());

        await this.registerContexts();
        this.registerTicketActions();
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance()
            .registerAction('article-attachment-zip-download', ArticleZipAttachmentDownloadAction);
        ActionFactory.getInstance().registerAction('ticket-search-action', TicketSearchAction);
        ActionFactory.getInstance().registerAction('show-user-tickets', ShowUserTicketsAction);
        ActionFactory.getInstance().registerAction('ticket-watch-action', TicketWatchAction);
        ActionFactory.getInstance().registerAction('ticket-lock-action', TicketLockAction);
        ActionFactory.getInstance().registerAction('ticket-print-action', TicketPrintAction);
    }

    private async registerContexts(): Promise<void> {
        const ticketContext = new ContextDescriptor(
            TicketContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'ticket-module', ['tickets'], TicketContext
        );
        await ContextService.getInstance().registerContext(ticketContext);

        const ticketDetailsContextDescriptor = new ContextDescriptor(
            TicketDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['tickets'], TicketDetailsContext
        );
        await ContextService.getInstance().registerContext(ticketDetailsContextDescriptor);

        const searchContext = new ContextDescriptor(
            TicketSearchContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-ticket-dialog', ['tickets'], TicketSearchContext
        );
        await ContextService.getInstance().registerContext(searchContext);

        const ticketListContext = new ContextDescriptor(
            TicketListContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'ticket-list-module', ['ticket-list'], TicketListContext
        );
        await ContextService.getInstance().registerContext(ticketListContext);
    }

}
