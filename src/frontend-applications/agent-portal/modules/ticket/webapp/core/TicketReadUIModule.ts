/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
    TicketPriorityService, QueueService, TicketFormService, ArticleFormService,
    TicketSearchDefinition, TicketHistoryLabelProvider, TicketTypeLabelProvider,
    TicketPriorityLabelProvider, TicketStateLabelProvider, TicketStateTypeLabelProvider, QueueLabelProvider,
    TicketTableCSSHandler, ArticleTableCSSHandler,
    ArticleZipAttachmentDownloadAction, TicketSearchAction, ShowUserTicketsAction,
    TicketWatchAction, TicketLockAction, TicketContext, TicketDetailsContext, TicketSearchContext, TicketListContext
} from '.';
import { TicketTableFactory } from './table/TicketTableFactory';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
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
import { SuggestedFAQHandler } from './SuggestedFAQHandler';
import { TicketHistoryTableFactory } from './table';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { JobTypes } from '../../../job/model/JobTypes';
import { TicketArticleCreateOptionFieldHandler } from './form/extended-form-manager/TicketArticleCreateOptionFieldHandler';
import { TicketCreateDynamicFieldsOptionFieldHandler } from './form/extended-form-manager/TicketCreateDynamicFieldsOptionFieldHandler';
import { AttachmentPatternRuleFieldsOptionFieldHandler } from './form/extended-form-manager/AttachmentPatternRuleFieldsOptionFieldHandler';
import { TicketJobFormManager } from './TicketJobFormManager';
import { TicketStateSetOptionFieldHandler } from './form/extended-form-manager/TicketStateSetOptionFieldHandler';
import { TeamSetOptionFieldHandler } from './form/extended-form-manager/TeamSetOptionFieldHandler';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';
import { ArticlePlaceholderHandler } from './ArticlePlaceholderHandler';
import { TableCSSHandlerRegistry } from '../../../table/webapp/core/css-handler/TableCSSHandlerRegistry';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { TicketLockLabelProvider } from './TicketLockLabelProvider';
import { DoNotSentEventHandler } from './DoNotSentEventHandler';
import { UserCounterEventHandler } from './UserCounterEventHandler';
import { JobFormService } from '../../../job/webapp/core/JobFormService';
import { MacroService } from '../../../macro/webapp/core/MacroService';
import { FetchAssetAttributesOptionFieldHandler } from './form/extended-form-manager/FetchAssetAttributesOptionFieldHandler';
import { TicketBulkPrintAction } from './actions/TicketBulkPrintAction';
import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { SearchService } from '../../../search/webapp/core/SearchService';

export class UIModule implements IUIModule {

    public name: string = 'TicketReadUIModule';

    public priority: number = 100;

    protected doRegisterContexts: boolean = true;

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(TicketPlaceholderHandler.getInstance());
        PlaceholderService.getInstance().registerPlaceholderHandler(ArticlePlaceholderHandler.getInstance());

        BrowserCacheService.getInstance().addDependencies(
            PersonalSettingsProperty.USER_LANGUAGE, [KIXObjectType.TICKET]
        );

        ServiceRegistry.registerServiceInstance(TicketService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketTypeService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityService.getInstance());
        ServiceRegistry.registerServiceInstance(QueueService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        ServiceRegistry.registerServiceInstance(ArticleFormService.getInstance());
        ServiceRegistry.registerServiceInstance(ChannelService.getInstance());

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
        LabelService.getInstance().registerLabelProvider(new TicketLockLabelProvider());

        TableFactoryService.getInstance().registerFactory(new TicketTableFactory());
        TableFactoryService.getInstance().registerFactory(new ArticleTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketHistoryTableFactory());

        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.TICKET, new TicketTableCSSHandler()
        );
        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.ARTICLE, new ArticleTableCSSHandler()
        );

        ServiceRegistry.registerAdditionalTableObjectsHandler(new SuggestedFAQHandler());

        this.registerTicketActions();

        JobFormService.getInstance().registerJobFormManager(JobTypes.TICKET, new TicketJobFormManager());

        DoNotSentEventHandler.getInstance();
        UserCounterEventHandler.getInstance();

        if (this.doRegisterContexts) {
            await this.registerContexts();
        }
    }

    public async registerExtensions(): Promise<void> {
        MacroService.getInstance().registerOptionFieldHandler(new TicketArticleCreateOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new TicketCreateDynamicFieldsOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new AttachmentPatternRuleFieldsOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new TicketStateSetOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new TeamSetOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new FetchAssetAttributesOptionFieldHandler());
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance()
            .registerAction('article-attachment-zip-download', ArticleZipAttachmentDownloadAction);
        ActionFactory.getInstance().registerAction('ticket-search-action', TicketSearchAction);
        ActionFactory.getInstance().registerAction('show-user-tickets', ShowUserTicketsAction);
        ActionFactory.getInstance().registerAction('ticket-watch-action', TicketWatchAction);
        ActionFactory.getInstance().registerAction('ticket-lock-action', TicketLockAction);
        ActionFactory.getInstance().registerAction('ticket-print-action', TicketPrintAction);
        ActionFactory.getInstance().registerAction(
            'ticket-bulk-print-action', TicketBulkPrintAction, [ConfigurationType.TableWidget]
        );
    }

    private async registerContexts(): Promise<void> {
        const ticketContext = new ContextDescriptor(
            TicketContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'ticket-module', ['tickets'], TicketContext,
            [
                new UIComponentPermission('tickets', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(ticketContext);

        const ticketDetailsContextDescriptor = new ContextDescriptor(
            TicketDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['tickets'], TicketDetailsContext,
            [
                new UIComponentPermission('tickets', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(ticketDetailsContextDescriptor);

        const searchContext = new ContextDescriptor(
            TicketSearchContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN, ContextMode.SEARCH,
            false, 'search', ['tickets'], TicketSearchContext,
            [
                new UIComponentPermission('tickets', [CRUD.READ])
            ],
            'Translatable#Ticket', 'kix-icon-ticket', null, 100
        );
        ContextService.getInstance().registerContext(searchContext);

        const ticketListContext = new ContextDescriptor(
            TicketListContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'ticket-list-module', ['ticket-list'], TicketListContext,
            [
                new UIComponentPermission('tickets', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(ticketListContext);
    }

}
