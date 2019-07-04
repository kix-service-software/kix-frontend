import {
    FactoryService, LabelService, ServiceRegistry, ContextService, ActionFactory, TableFactoryService
} from '../../../../core/browser';
import {
    KIXObjectType, ContextType, ContextMode, ContextDescriptor, ConfiguredDialogWidget,
    WidgetConfiguration
} from '../../../../core/model';
import {
    FAQArticleTableFactory, FAQArticleHistoryTableFactory, FAQLabelProvider, FAQArticleHistoryLabelProvider,
    FAQService, FAQArticleSearchContext, FAQArticleVoteAction, FAQArticlePrintAction,
    FAQArticleBrowserFactory, FAQArticleAttachmentBrowserFactory, FAQArticleSearchDefinition, FAQArticleFormService,
    FAQCategoryLabelProvider
} from '../../../../core/browser/faq';
import { DialogService } from '../../../../core/browser/components/dialog';
import { FAQCategoryBrowserFactory } from '../../../../core/browser/faq/FAQCategoryBrowserFactory';
import { KIXObjectSearchService } from '../../../../core/browser/kix/search/KIXObjectSearchService';
import { FAQContext } from '../../../../core/browser/faq/context/FAQContext';
import { FAQDetailsContext } from '../../../../core/browser/faq/context/FAQDetailsContext';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 400;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
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
        TableFactoryService.getInstance().registerFactory(new FAQArticleHistoryTableFactory());

        LabelService.getInstance().registerLabelProvider(new FAQLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQCategoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQArticleHistoryLabelProvider());

        ServiceRegistry.registerServiceInstance(FAQService.getInstance());
        ServiceRegistry.registerServiceInstance(FAQArticleFormService.getInstance());

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
