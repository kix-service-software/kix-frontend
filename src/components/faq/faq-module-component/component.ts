import {
    AbstractMarkoComponent, FactoryService, StandardTableFactoryService, LabelService, ServiceRegistry,
    KIXObjectSearchService, ContextService, DialogService, ActionFactory
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, KIXObjectCache, ContextType, ContextMode, ContextDescriptor, ConfiguredDialogWidget,
    WidgetConfiguration, WidgetSize
} from '@kix/core/dist/model';
import {
    FAQTableFactory, FAQArticleHistoryTableFactory, FAQLabelProvider, FAQArticleHistoryLabelProvider,
    FAQService, FAQContext, FAQDetailsContext, NewFAQArticleDialogContext, FAQArticleSearchContext,
    FAQArticleVoteAction, FAQArticlePrintAction, FAQArticleEditAction, FAQArticleDeleteAction,
    FAQArticleCreateAction, FAQArticleBrowserFactory, FAQArticleAttachmentBrowserFactory,
    FAQArticleSearchDefinition, FAQArticleFormService, EditFAQArticleDialogContext
} from '@kix/core/dist/browser/faq';
import { FAQCacheHandler } from '@kix/core/dist/model/kix/faq';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_ARTICLE, FAQArticleBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_ARTICLE_ATTACHMENT, FAQArticleAttachmentBrowserFactory.getInstance()
        );

        StandardTableFactoryService.getInstance().registerFactory(new FAQTableFactory());
        StandardTableFactoryService.getInstance().registerFactory(new FAQArticleHistoryTableFactory());

        LabelService.getInstance().registerLabelProvider(new FAQLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQArticleHistoryLabelProvider());

        ServiceRegistry.getInstance().registerServiceInstance(FAQService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(FAQArticleFormService.getInstance());

        KIXObjectCache.registerCacheHandler(new FAQCacheHandler());

        KIXObjectSearchService.getInstance().registerSearchDefinition(new FAQArticleSearchDefinition());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const faqContextDescriptor = new ContextDescriptor(
            FAQContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'faq', ['faqarticles'], FAQContext
        );
        ContextService.getInstance().registerContext(faqContextDescriptor);

        const faqDetailsContextDescriptor = new ContextDescriptor(
            FAQDetailsContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'faq-details', ['faqarticles'], FAQDetailsContext
        );
        ContextService.getInstance().registerContext(faqDetailsContextDescriptor);

        const newFAQArticleContext = new ContextDescriptor(
            NewFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-faq-article-dialog', ['faqarticles'], NewFAQArticleDialogContext
        );
        ContextService.getInstance().registerContext(newFAQArticleContext);

        const editFAQArticleContext = new ContextDescriptor(
            EditFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-faq-article-dialog', ['faqarticles'], EditFAQArticleDialogContext
        );
        ContextService.getInstance().registerContext(editFAQArticleContext);

        const searchContactContext = new ContextDescriptor(
            FAQArticleSearchContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-faq-article-dialog', ['faqarticles'], FAQArticleSearchContext
        );
        ContextService.getInstance().registerContext(searchContactContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-faq-article-dialog',
            new WidgetConfiguration(
                'new-faq-article-dialog', 'Neue FAQ', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-new-faq'
            ),
            KIXObjectType.FAQ_ARTICLE,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-faq-article-dialog',
            new WidgetConfiguration(
                'edit-faq-article-dialog', 'FAQ Eintrag Bearbeiten', [], {}, false,
                false, WidgetSize.BOTH, 'kix-icon-edit'
            ),
            KIXObjectType.FAQ_ARTICLE,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-faq-article-dialog',
            new WidgetConfiguration(
                'search-faq-article-dialog', 'FAQ Suche', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-search-faq'
            ),
            KIXObjectType.FAQ_ARTICLE,
            ContextMode.SEARCH
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('faq-article-create-action', FAQArticleCreateAction);
        ActionFactory.getInstance().registerAction('faq-article-delete-action', FAQArticleDeleteAction);
        ActionFactory.getInstance().registerAction('faq-article-edit-action', FAQArticleEditAction);
        ActionFactory.getInstance().registerAction('faq-article-print-action', FAQArticlePrintAction);
        ActionFactory.getInstance().registerAction('faq-article-vote-action', FAQArticleVoteAction);
    }

}

module.exports = Component;
