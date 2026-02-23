/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import {
    TicketTableCSSHandler, ArticleTableCSSHandler,
    ArticleZipAttachmentDownloadAction, TicketSearchAction, ShowUserTicketsAction,
    TicketWatchAction, TicketLockAction, TicketContext, TicketDetailsContext, TicketSearchContext, TicketListContext
} from '.';
import { TicketTableFactory } from './table/TicketTableFactory';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { ArticleTableFactory } from './table/ArticleTableFactory';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { TicketPrintAction } from './actions/TicketPrintAction';
import { SuggestedFAQHandler } from './SuggestedFAQHandler';
import { TicketHistoryTableFactory } from './table';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { TicketArticleCreateOptionFieldHandler } from './form/extended-form-manager/TicketArticleCreateOptionFieldHandler';
import { TicketCreateDynamicFieldsOptionFieldHandler } from './form/extended-form-manager/TicketCreateDynamicFieldsOptionFieldHandler';
import { AttachmentPatternRuleFieldsOptionFieldHandler } from './form/extended-form-manager/AttachmentPatternRuleFieldsOptionFieldHandler';
import { TicketStateSetOptionFieldHandler } from './form/extended-form-manager/TicketStateSetOptionFieldHandler';
import { TeamSetOptionFieldHandler } from './form/extended-form-manager/TeamSetOptionFieldHandler';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';
import { TableCSSHandlerRegistry } from '../../../table/webapp/core/css-handler/TableCSSHandlerRegistry';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { DoNotSentEventHandler } from './DoNotSentEventHandler';
import { UserCounterEventHandler } from './UserCounterEventHandler';
import { MacroService } from '../../../macro/webapp/core/MacroService';
import { FetchAssetAttributesOptionFieldHandler } from './form/extended-form-manager/FetchAssetAttributesOptionFieldHandler';
import { TicketBulkPrintAction } from './actions/TicketBulkPrintAction';
import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { PersonalSettingsService } from '../../../user/model/PersonalSettingsService';
import { TicketInitialSiteURLNodesService } from './TicketInitialSiteURLNodesService';

export class UIModule implements IUIModule {

    public name: string = 'TicketReadUIModule';

    public priority: number = 101;

    protected doRegisterContexts: boolean = true;

    public async register(): Promise<void> {
        BrowserCacheService.getInstance().addDependencies(
            PersonalSettingsProperty.USER_LANGUAGE, [KIXObjectType.TICKET]
        );

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

        DoNotSentEventHandler.getInstance();
        UserCounterEventHandler.getInstance();

        if (this.doRegisterContexts) {
            await this.registerContexts();
        }

        PersonalSettingsService.getInstance().registerInitialURLSiteExtendedService(
            new TicketInitialSiteURLNodesService()
        );
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
