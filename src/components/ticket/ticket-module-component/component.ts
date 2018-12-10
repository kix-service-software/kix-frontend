import { ComponentState } from "./ComponentState";
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, StandardTableFactoryService, FactoryService,
    FormValidationService, ContextService, ActionFactory, DialogService, KIXObjectSearchService
} from "@kix/core/dist/browser";
import {
    TicketService, TicketHistoryLabelProvider, ArticleLabelProvider, TicketLabelProvider, TicketTableFactory,
    TicketHistoryTableFactory, PendingTimeValidator, TicketBrowserFactory, ArticleBrowserFactory, TicketFormService,
    TicketContext, TicketDetailsContext, NewTicketDialogContext, TicketSearchContext, EditTicketDialogContext,
    NewTicketArticleContext, TicketListContext, ArticleZipAttachmentDownloadAction, ArticleBulkAction,
    ArticleCallIncomingAction, ArticleCallOutgoingAction, ArticleCommunicationAction, ArticleEditAction,
    ArticleMaximizeAction, ArticleNewEmailAction, ArticleNewNoteAction, ArticlePrintAction, ArticleTagAction,
    TicketEditAction, TicketLockAction, TicketMergeAction, TicketCreateAction, TicketPrintAction, TicketSpamAction,
    TicketWatchAction, TicketSearchAction, ShowUserTicketsAction, TicketSearchDefinition, TicketTypeCreateAction,
    TicketTypeImportAction, TicketTypeDeleteAction, TicketTypeTableFactory, TicketTypeLabelProvider,
    TicketTypeBrowserFactory, TicketTypeDetailsContext, TicketTypeTableDeleteAction,
    TicketPriorityImportAction, TicketPriorityTableDeleteAction, TicketPriorityDeleteAction,
    TicketPriorityTableFactory, TicketPriorityLabelProvider, TicketPriorityBrowserFactory,
    EditTicketTypeDialogContext, TicketTypeEditTextmodulesAction, TicketStateService,
    TicketStateLabelProvider, TicketStateTableFactory, TicketStateBrowserFactory, TicketStateCreateAction,
    TicketStateTableDeleteAction, TicketStateImportAction, TicketStateDetailsContext, TicketStateEditTextmodulesAction,
    TicketStateEditAction, TicketStateDuplicateAction, TicketStateDeleteAction,
    TicketPriorityCreateAction, TicketTypeDuplicateAction,
    TicketTypeEditAction, NewTicketTypeDialogContext, TicketTypeFormService, TicketTypeService, TicketPriorityService,
    TicketPriorityDetailsContext,
    TicketPriorityEditAction,
    TicketPriorityDuplicateAction,
    NewTicketPriorityDialogContext,
    EditTicketPriorityDialogContext,
    TicketPriorityFormService
} from "@kix/core/dist/browser/ticket";
import {
    KIXObjectType, KIXObjectCache, TicketCacheHandler, ContextDescriptor, ContextMode, ContextType,
    ConfiguredDialogWidget, WidgetConfiguration, WidgetSize, TicketTypeCacheHandler, TicketStateCacheHandler,
    TicketPriorityCacheHandler
} from "@kix/core/dist/model";

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.getInstance().registerServiceInstance(TicketService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(TicketTypeService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(TicketStateService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(TicketPriorityService.getInstance());

        ServiceRegistry.getInstance().registerServiceInstance(TicketFormService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(TicketTypeFormService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(TicketPriorityFormService.getInstance());

        KIXObjectCache.registerCacheHandler(new TicketCacheHandler());
        KIXObjectCache.registerCacheHandler(new TicketTypeCacheHandler());
        KIXObjectCache.registerCacheHandler(new TicketStateCacheHandler());
        KIXObjectCache.registerCacheHandler(new TicketPriorityCacheHandler());

        KIXObjectSearchService.getInstance().registerSearchDefinition(new TicketSearchDefinition());

        LabelService.getInstance().registerLabelProvider(new TicketLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ArticleLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketHistoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketPriorityLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateLabelProvider());

        StandardTableFactoryService.getInstance().registerFactory(new TicketTableFactory());
        StandardTableFactoryService.getInstance().registerFactory(new TicketHistoryTableFactory());
        StandardTableFactoryService.getInstance().registerFactory(new TicketTypeTableFactory());
        StandardTableFactoryService.getInstance().registerFactory(new TicketPriorityTableFactory());
        StandardTableFactoryService.getInstance().registerFactory(new TicketStateTableFactory());

        FormValidationService.getInstance().registerValidator(new PendingTimeValidator());

        FactoryService.getInstance().registerFactory(KIXObjectType.TICKET, TicketBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.ARTICLE, ArticleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.TICKET_TYPE, TicketTypeBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_PRIORITY, TicketPriorityBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_STATE, TicketStateBrowserFactory.getInstance()
        );

        TicketFormService.getInstance();
        TicketTypeFormService.getInstance();

        this.registerContexts();
        this.registerAdminContexts();
        this.registerTicketActions();
        this.registerTicketAdminActions();
        this.registerTicketDialogs();
        this.registerTicketAdminDialogs();
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
            true, 'ticket-details', ['tickets'], TicketDetailsContext
        );
        ContextService.getInstance().registerContext(ticketDetailsContextDescriptor);

        const newTicketContext = new ContextDescriptor(
            NewTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-ticket-dialog', ['tickets'], NewTicketDialogContext
        );
        ContextService.getInstance().registerContext(newTicketContext);

        const searchContext = new ContextDescriptor(
            TicketSearchContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-ticket-dialog', ['tickets'], TicketSearchContext
        );
        ContextService.getInstance().registerContext(searchContext);

        const editTicketContext = new ContextDescriptor(
            EditTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-ticket-dialog', ['tickets'], EditTicketDialogContext
        );
        ContextService.getInstance().registerContext(editTicketContext);

        const newTicketArticleContext = new ContextDescriptor(
            NewTicketArticleContext.CONTEXT_ID, [KIXObjectType.ARTICLE], ContextType.DIALOG, ContextMode.CREATE_SUB,
            true, 'new-ticket-article-dialog', ['articles'], NewTicketArticleContext
        );
        ContextService.getInstance().registerContext(newTicketArticleContext);

        const ticketListContext = new ContextDescriptor(
            TicketListContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'ticket-list-module', ['ticket-list'], TicketListContext
        );
        ContextService.getInstance().registerContext(ticketListContext);
    }

    private registerAdminContexts(): void {
        const ticketTypeDetailsContextDescriptor = new ContextDescriptor(
            TicketTypeDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'ticket-type-details', ['tickettypes'], TicketTypeDetailsContext
        );
        ContextService.getInstance().registerContext(ticketTypeDetailsContextDescriptor);

        const newTicketTypeContext = new ContextDescriptor(
            NewTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-ticket-type-dialog', ['tickettypes'], NewTicketDialogContext
        );
        ContextService.getInstance().registerContext(newTicketTypeContext);

        const editTicketTypeContext = new ContextDescriptor(
            EditTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-type-dialog', ['tickettypes'], EditTicketTypeDialogContext
        );
        ContextService.getInstance().registerContext(editTicketTypeContext);

        const ticketStateDetailsContextDescriptor = new ContextDescriptor(
            TicketStateDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'ticket-state-details', ['ticketstates'], TicketStateDetailsContext
        );
        ContextService.getInstance().registerContext(ticketStateDetailsContextDescriptor);

        const ticketPriorityDetailsContextDescriptor = new ContextDescriptor(
            TicketPriorityDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'ticket-priority-details', ['priorities'], TicketPriorityDetailsContext
        );
        ContextService.getInstance().registerContext(ticketPriorityDetailsContextDescriptor);

        const newTicketPriorityContext = new ContextDescriptor(
            NewTicketPriorityDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-ticket-priority-dialog', ['priorities'], NewTicketPriorityDialogContext
        );
        ContextService.getInstance().registerContext(newTicketPriorityContext);

        const editTicketPriorityContext = new ContextDescriptor(
            EditTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-priority-dialog', ['priorities'], EditTicketPriorityDialogContext
        );
        ContextService.getInstance().registerContext(editTicketPriorityContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance()
            .registerAction('article-attachment-zip-download', ArticleZipAttachmentDownloadAction);
        ActionFactory.getInstance().registerAction('article-bulk-action', ArticleBulkAction);
        ActionFactory.getInstance().registerAction('article-call-incoming-action', ArticleCallIncomingAction);
        ActionFactory.getInstance().registerAction('article-call-outgoing-action', ArticleCallOutgoingAction);
        ActionFactory.getInstance().registerAction('article-communication-action', ArticleCommunicationAction);
        ActionFactory.getInstance().registerAction('article-edit-action', ArticleEditAction);
        ActionFactory.getInstance().registerAction('article-maximize-action', ArticleMaximizeAction);
        ActionFactory.getInstance().registerAction('article-new-email-action', ArticleNewEmailAction);
        ActionFactory.getInstance().registerAction('article-new-note-action', ArticleNewNoteAction);
        ActionFactory.getInstance().registerAction('article-print-action', ArticlePrintAction);
        ActionFactory.getInstance().registerAction('article-tag-action', ArticleTagAction);

        ActionFactory.getInstance().registerAction('ticket-edit-action', TicketEditAction);
        ActionFactory.getInstance().registerAction('ticket-lock-action', TicketLockAction);
        ActionFactory.getInstance().registerAction('ticket-merge-action', TicketMergeAction);
        ActionFactory.getInstance().registerAction('ticket-create-action', TicketCreateAction);
        ActionFactory.getInstance().registerAction('ticket-print-action', TicketPrintAction);
        ActionFactory.getInstance().registerAction('ticket-spam-action', TicketSpamAction);
        ActionFactory.getInstance().registerAction('ticket-watch-action', TicketWatchAction);
        ActionFactory.getInstance().registerAction('ticket-bulk-action', ArticleBulkAction);
        ActionFactory.getInstance().registerAction('ticket-search-action', TicketSearchAction);

        ActionFactory.getInstance().registerAction('show-user-tickets', ShowUserTicketsAction);
    }

    private registerTicketAdminActions(): void {
        ActionFactory.getInstance().registerAction('ticket-admin-type-create', TicketTypeCreateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-table-delete', TicketTypeTableDeleteAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-import', TicketTypeImportAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-edit', TicketTypeEditAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-duplication', TicketTypeDuplicateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-delete', TicketTypeDeleteAction);
        ActionFactory.getInstance().registerAction(
            'ticket-admin-type-textmodules-edit', TicketTypeEditTextmodulesAction
        );

        ActionFactory.getInstance().registerAction('ticket-admin-priority-create', TicketPriorityCreateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-priority-table-delete',
            TicketPriorityTableDeleteAction
        );
        ActionFactory.getInstance().registerAction('ticket-admin-priority-import', TicketPriorityImportAction);
        ActionFactory.getInstance().registerAction('ticket-admin-priority-delete', TicketPriorityDeleteAction);
        ActionFactory.getInstance().registerAction('ticket-admin-priority-edit', TicketPriorityEditAction);
        ActionFactory.getInstance().registerAction('ticket-admin-priority-duplication', TicketPriorityDuplicateAction);

        ActionFactory.getInstance().registerAction('ticket-admin-state-create', TicketStateCreateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-table-delete', TicketStateTableDeleteAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-import', TicketStateImportAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-edit', TicketStateEditAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-duplication', TicketStateDuplicateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-delete', TicketStateDeleteAction);
        ActionFactory.getInstance().registerAction(
            'ticket-admin-state-textmodules-edit', TicketStateEditTextmodulesAction
        );
    }

    private registerTicketDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-dialog',
            new WidgetConfiguration(
                'new-ticket-dialog', 'Neues Ticket', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-new-ticket'
            ),
            KIXObjectType.TICKET,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-ticket-dialog',
            new WidgetConfiguration(
                'search-ticket-dialog', 'Ticketsuche', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-search-ticket'
            ),
            KIXObjectType.TICKET,
            ContextMode.SEARCH
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-ticket-dialog',
            new WidgetConfiguration(
                'edit-ticket-dialog', 'Ticket bearbeiten', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-edit'
            ),
            KIXObjectType.TICKET,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-article-dialog',
            new WidgetConfiguration(
                'new-ticket-article-dialog', 'Neuer Artikel', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-new-note'
            ),
            KIXObjectType.ARTICLE,
            ContextMode.CREATE_SUB
        ));
    }

    private registerTicketAdminDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-type-dialog',
            new WidgetConfiguration(
                'new-ticket-type-dialog', 'Typ hinzufügen', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-gear'
            ),
            KIXObjectType.TICKET_TYPE,
            ContextMode.CREATE_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-ticket-type-dialog',
            new WidgetConfiguration(
                'edit-ticket-type-dialog', 'Typ bearbeiten', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-gear'
            ),
            KIXObjectType.TICKET_TYPE,
            ContextMode.EDIT_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-priority-dialog',
            new WidgetConfiguration(
                'new-ticket-priority-dialog', 'Priorität hinzufügen', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-gear'
            ),
            KIXObjectType.TICKET_PRIORITY,
            ContextMode.CREATE_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-ticket-priority-dialog',
            new WidgetConfiguration(
                'edit-ticket-priority-dialog', 'Priorität bearbeiten', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-gear'
            ),
            KIXObjectType.TICKET_PRIORITY,
            ContextMode.EDIT_ADMIN
        ));

    }
}

module.exports = Component;
