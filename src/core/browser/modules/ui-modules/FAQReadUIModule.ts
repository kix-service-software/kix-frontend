/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    FactoryService, LabelService, ServiceRegistry, ContextService, ActionFactory, TableFactoryService
} from '../../../../core/browser';
import {
    KIXObjectType, ContextType, ContextMode, ContextDescriptor, ConfiguredDialogWidget,
    WidgetConfiguration,
    Bookmark,
    CRUD
} from '../../../../core/model';
import {
    FAQArticleTableFactory, FAQArticleHistoryTableFactory, FAQLabelProvider, FAQArticleHistoryLabelProvider,
    FAQService, FAQArticleSearchContext, FAQArticleVoteAction,
    FAQArticleBrowserFactory, FAQArticleAttachmentBrowserFactory, FAQArticleSearchDefinition, FAQArticleFormService,
    FAQCategoryLabelProvider,
    LoadFAQAricleAction
} from '../../../../core/browser/faq';
import { DialogService } from '../../../../core/browser/components/dialog';
import { FAQCategoryBrowserFactory } from '../../../../core/browser/faq/FAQCategoryBrowserFactory';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';
import { FAQContext } from '../../../../core/browser/faq/context/FAQContext';
import { FAQDetailsContext } from '../../../../core/browser/faq/context/FAQDetailsContext';
import { IUIModule } from '../../application/IUIModule';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { BookmarkService } from '../../bookmark/BookmarkService';
import { TranslationService } from '../../i18n/TranslationService';

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

        SearchService.getInstance().registerSearchDefinition(new FAQArticleSearchDefinition());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
        await this.registerBookmarks();
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
        ActionFactory.getInstance().registerAction('faq-article-vote-action', FAQArticleVoteAction);
        ActionFactory.getInstance().registerAction('load-faq-article-action', LoadFAQAricleAction);
    }

    private async registerBookmarks(): Promise<void> {
        const language = await TranslationService.getUserLanguage();

        const isGerman = language === 'de';

        const faqIds = [
            isGerman ? 1 : 2,
            isGerman ? 3 : 4,
            isGerman ? 5 : 6,
            isGerman ? 7 : 8,
        ];

        const bookmarks = [
            new Bookmark(
                'Translatable#General information on how to work with KIX 18',
                'kix-icon-faq', 'load-faq-article-action',
                faqIds[0],
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            ),
            new Bookmark(
                'Translatable#How do I search in KIX 18?', 'kix-icon-faq', 'load-faq-article-action', faqIds[1],
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            ),
            new Bookmark(
                'Translatable#How do I create a new ticket?', 'kix-icon-faq', 'load-faq-article-action', faqIds[3],
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            ),
            new Bookmark(
                'Translatable#Selected ticket functions', 'kix-icon-faq', 'load-faq-article-action', faqIds[2],
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            )
        ];

        BookmarkService.getInstance().publishBookmarks('faq', bookmarks);
    }

}
