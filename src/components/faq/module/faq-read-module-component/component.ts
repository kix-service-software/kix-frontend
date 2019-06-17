import {
    AbstractMarkoComponent, FactoryService, LabelService, ServiceRegistry,
    KIXObjectSearchService, ContextService, ActionFactory, TableFactoryService
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, ContextType, ContextMode, ContextDescriptor, ConfiguredDialogWidget,
    WidgetConfiguration, WidgetSize
} from '../../../../core/model';
import {
    FAQArticleTableFactory, FAQArticleHistoryTableFactory, FAQLabelProvider, FAQArticleHistoryLabelProvider,
    FAQService, FAQContext, FAQDetailsContext, FAQArticleSearchContext, FAQArticleVoteAction, FAQArticlePrintAction,
    FAQArticleBrowserFactory, FAQArticleAttachmentBrowserFactory, FAQArticleSearchDefinition, FAQArticleFormService,
    FAQCategoryLabelProvider, FAQCategoryFormService
} from '../../../../core/browser/faq';
import { DialogService } from '../../../../core/browser/components/dialog';
import { FAQCategoryTableFactory } from '../../../../core/browser/faq/admin';
import { FAQCategoryBrowserFactory } from '../../../../core/browser/faq/FAQCategoryBrowserFactory';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_ARTICLE, FAQArticleBrowserFactory.getInstance()
        );

        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_CATEGORY, FAQCategoryBrowserFactory.getInstance()
        );

        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_ARTICLE_ATTACHMENT, FAQArticleAttachmentBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new FAQArticleTableFactory());
        TableFactoryService.getInstance().registerFactory(new FAQCategoryTableFactory());
        TableFactoryService.getInstance().registerFactory(new FAQArticleHistoryTableFactory());

        LabelService.getInstance().registerLabelProvider(new FAQLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQCategoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQArticleHistoryLabelProvider());

        ServiceRegistry.registerServiceInstance(FAQService.getInstance());
        ServiceRegistry.registerServiceInstance(FAQArticleFormService.getInstance());
        ServiceRegistry.registerServiceInstance(FAQCategoryFormService.getInstance());

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
            true, 'object-details-page', ['faqarticles'], FAQDetailsContext
        );
        ContextService.getInstance().registerContext(faqDetailsContextDescriptor);

        const searchFAQArticleContext = new ContextDescriptor(
            FAQArticleSearchContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-faq-article-dialog', ['faqarticles'], FAQArticleSearchContext
        );
        ContextService.getInstance().registerContext(searchFAQArticleContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-faq-article-dialog',
            new WidgetConfiguration(
                'search-faq-article-dialog', 'Translatable#FAQ Search', [], {},
                false, false, 'kix-icon-search-faq'
            ),
            KIXObjectType.FAQ_ARTICLE,
            ContextMode.SEARCH
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('faq-article-print-action', FAQArticlePrintAction);
        ActionFactory.getInstance().registerAction('faq-article-vote-action', FAQArticleVoteAction);
    }

}

module.exports = Component;
