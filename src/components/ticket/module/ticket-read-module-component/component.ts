import {
    AbstractMarkoComponent, ServiceRegistry, KIXObjectSearchService, LabelService, TableFactoryService,
    TableCSSHandlerRegistry, FactoryService, ContextService, DialogService, ActionFactory
} from "../../../../core/browser";
import { ComponentState } from './ComponentState';
import {
    TicketSearchDefinition, TicketLabelProvider, TicketTemplateService, QueueService,
    TicketPriorityService, TicketStateService, TicketTypeService, TicketService, ArticleLabelProvider,
    TicketHistoryLabelProvider, TicketTypeLabelProvider, TicketPriorityLabelProvider, TicketStateLabelProvider,
    TicketStateTypeLabelProvider, QueueLabelProvider, TicketTemplateLabelProvider, TicketTableFactory,
    TicketHistoryTableFactory, TicketTableCSSHandler, ArticleTableCSSHandler, TicketBrowserFactory,
    ArticleBrowserFactory, TicketTypeBrowserFactory, TicketPriorityBrowserFactory, TicketStateBrowserFactory,
    TicketStateTypeBrowserFactory, QueueBrowserFactory, FollowUpTypeBrowserFactory, TicketTemplateBrowserFactory,
    TicketContext, TicketDetailsContext, TicketSearchContext, TicketListContext, ArticleZipAttachmentDownloadAction,
    ArticlePrintAction, TicketPrintAction, TicketSearchAction, ShowUserTicketsAction, TicketPriorityTableFactory,
    TicketQueueTableFactory, TicketTypeTableFactory, TicketStateTableFactory, TicketFormService,
    EmailRecipientValidator, PendingTimeValidator, ArticleFormService
} from "../../../../core/browser/ticket";
import { ChannelService } from "../../../../core/browser/channel";
import { ChannelLabelProvider } from "../../../../core/browser/channel/ChannelLabelProvider";
import { ArticleTableFactory } from "../../../../core/browser/ticket/table/ArticleTableFactory";
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, WidgetSize
} from "../../../../core/model";
import { FormValidationService } from "../../../../core/browser/form/validation";

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
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
        TableFactoryService.getInstance().registerFactory(new TicketPriorityTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketQueueTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketTypeTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketStateTableFactory());

        TableCSSHandlerRegistry.getInstance().registerCSSHandler(KIXObjectType.TICKET, new TicketTableCSSHandler());
        TableCSSHandlerRegistry.getInstance().registerCSSHandler(KIXObjectType.ARTICLE, new ArticleTableCSSHandler());

        FactoryService.getInstance().registerFactory(KIXObjectType.TICKET, TicketBrowserFactory.getInstance());
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
        ActionFactory.getInstance().registerAction('article-print-action', ArticlePrintAction);
        ActionFactory.getInstance().registerAction('ticket-print-action', TicketPrintAction);
        ActionFactory.getInstance().registerAction('ticket-search-action', TicketSearchAction);
        ActionFactory.getInstance().registerAction('show-user-tickets', ShowUserTicketsAction);
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
                false, false, WidgetSize.BOTH, 'kix-icon-search-ticket'
            ),
            KIXObjectType.TICKET,
            ContextMode.SEARCH
        ));
    }
}

module.exports = Component;
