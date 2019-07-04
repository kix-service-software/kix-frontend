import { IUIModule } from "../../application/IUIModule";
import { PlaceholderService } from "../../placeholder";
import { TableFactoryService, TableCSSHandlerRegistry } from "../../table";
import {
    KIXObjectType, ContextDescriptor, ContextMode, ContextType, ConfiguredDialogWidget, WidgetConfiguration
} from "../../../model";
import { ActionFactory } from "../../ActionFactory";
import { ContextService } from "../../context";
import { DialogService } from "../../components";
import {
    TicketPlaceholderHandler, TicketService, TicketFormService, ArticleFormService, TicketTypeService,
    TicketStateService, TicketPriorityService, QueueService, TicketTemplateService, PendingTimeValidator,
    EmailRecipientValidator, TicketSearchDefinition, TicketLabelProvider, ArticleLabelProvider,
    TicketHistoryLabelProvider, TicketTypeLabelProvider, TicketPriorityLabelProvider, TicketStateLabelProvider,
    TicketStateTypeLabelProvider, QueueLabelProvider, TicketTemplateLabelProvider, TicketTableFactory,
    TicketHistoryTableFactory, TicketTableCSSHandler, TicketBrowserFactory, TicketHistoryBrowserFactory,
    ArticleBrowserFactory, TicketTypeBrowserFactory, TicketPriorityBrowserFactory, TicketStateBrowserFactory,
    TicketStateTypeBrowserFactory, ArticleTableCSSHandler, QueueBrowserFactory, FollowUpTypeBrowserFactory,
    TicketTemplateBrowserFactory, ArticleZipAttachmentDownloadAction, TicketPrintAction, TicketSearchAction,
    TicketWatchAction, ShowUserTicketsAction, TicketLockAction, TicketContext, TicketDetailsContext,
    TicketSearchContext, TicketListContext
} from "../../ticket";
import { ChannelService } from "../../channel";
import { ServiceRegistry, FactoryService } from "../../kix";
import { FormValidationService } from "../../form/validation";
import { KIXObjectSearchService } from "../../kix/search/KIXObjectSearchService";
import { LabelService } from "../../LabelService";
import { ChannelLabelProvider } from "../../channel/ChannelLabelProvider";
import { ArticleTableFactory } from "../../ticket/table/ArticleTableFactory";

export class UIModule implements IUIModule {

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public priority: number = 100;

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new TicketPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(TicketService.getInstance());
        ServiceRegistry.registerServiceInstance(ChannelService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketTypeService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityService.getInstance());
        ServiceRegistry.registerServiceInstance(QueueService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketTemplateService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        ServiceRegistry.registerServiceInstance(ArticleFormService.getInstance());

        FormValidationService.getInstance().registerValidator(new PendingTimeValidator());
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        TicketFormService.getInstance();

        KIXObjectSearchService.getInstance().registerSearchDefinition(new TicketSearchDefinition());

        LabelService.getInstance().registerLabelProvider(new TicketLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ArticleLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketHistoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketPriorityLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ChannelLabelProvider());
        LabelService.getInstance().registerLabelProvider(new QueueLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketTemplateLabelProvider());

        TableFactoryService.getInstance().registerFactory(new TicketTableFactory());
        TableFactoryService.getInstance().registerFactory(new ArticleTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketHistoryTableFactory());

        TableCSSHandlerRegistry.getInstance().registerCSSHandler(KIXObjectType.TICKET, new TicketTableCSSHandler());
        TableCSSHandlerRegistry.getInstance().registerCSSHandler(KIXObjectType.ARTICLE, new ArticleTableCSSHandler());

        FactoryService.getInstance().registerFactory(KIXObjectType.TICKET, TicketBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_HISTORY, TicketHistoryBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(KIXObjectType.ARTICLE, ArticleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.TICKET_TYPE, TicketTypeBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_PRIORITY, TicketPriorityBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_STATE, TicketStateBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_STATE_TYPE, TicketStateTypeBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.QUEUE, QueueBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.FOLLOW_UP_TYPE, FollowUpTypeBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_TEMPLATE, TicketTemplateBrowserFactory.getInstance()
        );

        this.registerContexts();
        this.registerTicketActions();
        this.registerTicketDialogs();
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance()
            .registerAction('article-attachment-zip-download', ArticleZipAttachmentDownloadAction);
        ActionFactory.getInstance().registerAction('ticket-print-action', TicketPrintAction);
        ActionFactory.getInstance().registerAction('ticket-search-action', TicketSearchAction);
        ActionFactory.getInstance().registerAction('show-user-tickets', ShowUserTicketsAction);
        ActionFactory.getInstance().registerAction('ticket-watch-action', TicketWatchAction);
        ActionFactory.getInstance().registerAction('ticket-lock-action', TicketLockAction);
    }

    private registerContexts(): void {
        const ticketContext = new ContextDescriptor(
            TicketContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'tickets', ['tickets'], TicketContext
        );
        ContextService.getInstance().registerContext(ticketContext);

        const ticketDetailsContextDescriptor = new ContextDescriptor(
            TicketDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['tickets'], TicketDetailsContext
        );
        ContextService.getInstance().registerContext(ticketDetailsContextDescriptor);

        const searchContext = new ContextDescriptor(
            TicketSearchContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-ticket-dialog', ['tickets'], TicketSearchContext
        );
        ContextService.getInstance().registerContext(searchContext);

        const ticketListContext = new ContextDescriptor(
            TicketListContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'ticket-list-module', ['ticket-list'], TicketListContext
        );
        ContextService.getInstance().registerContext(ticketListContext);
    }


    private registerTicketDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-ticket-dialog',
            new WidgetConfiguration(
                'search-ticket-dialog', 'Translatable#Ticket Search', [], {},
                false, false, 'kix-icon-search-ticket'
            ),
            KIXObjectType.TICKET,
            ContextMode.SEARCH
        ));
    }
}
