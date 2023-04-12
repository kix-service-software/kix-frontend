/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../../model/IUIModule';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import {
    FAQArticleTableFactory, FAQArticleHistoryTableFactory,
    FAQLabelProvider, FAQCategoryLabelProvider, FAQArticleHistoryLabelProvider, FAQService, FAQArticleFormService,
    FAQArticleSearchDefinition, FAQArticleSearchContext, FAQArticleVoteAction, LoadFAQAricleAction
} from '..';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { SearchService } from '../../../../search/webapp/core';
import { ContextDescriptor } from '../../../../../model/ContextDescriptor';
import { FAQContext } from '../context/FAQContext';
import { ContextType } from '../../../../../model/ContextType';
import { ContextMode } from '../../../../../model/ContextMode';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { FAQDetailsContext } from '../context/FAQDetailsContext';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { FAQArticleVoteFormService } from '../FAQArticleVoteFormService';



export class UIModule implements IUIModule {

    public priority: number = 400;

    public name: string = 'FAQReadUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        TableFactoryService.getInstance().registerFactory(new FAQArticleTableFactory());
        TableFactoryService.getInstance().registerFactory(new FAQArticleHistoryTableFactory());

        LabelService.getInstance().registerLabelProvider(new FAQLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQCategoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQArticleHistoryLabelProvider());

        ServiceRegistry.registerServiceInstance(FAQService.getInstance());
        ServiceRegistry.registerServiceInstance(FAQArticleFormService.getInstance());
        ServiceRegistry.registerServiceInstance(FAQArticleVoteFormService.getInstance());

        SearchService.getInstance().registerSearchDefinition(new FAQArticleSearchDefinition());

        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const faqContextDescriptor = new ContextDescriptor(
            FAQContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'faq', ['faqarticles'], FAQContext,
            [
                new UIComponentPermission('faq/articles', [CRUD.READ])
            ],
            'Translatable#FAQ', 'kix-icon-faq'
        );
        ContextService.getInstance().registerContext(faqContextDescriptor);

        const faqDetailsContextDescriptor = new ContextDescriptor(
            FAQDetailsContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['faqarticles'], FAQDetailsContext,
            [
                new UIComponentPermission('faq/articles', [CRUD.READ])
            ],
            'Translatable#FAQ Details', 'kix-icon-faq'
        );
        ContextService.getInstance().registerContext(faqDetailsContextDescriptor);

        const searchFAQArticleContext = new ContextDescriptor(
            FAQArticleSearchContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.MAIN, ContextMode.SEARCH,
            false, 'search', ['faqarticles'], FAQArticleSearchContext,
            [
                new UIComponentPermission('faq/articles', [CRUD.READ])
            ],
            'Translatable#FAQ', 'kix-icon-faq', null, 400
        );
        ContextService.getInstance().registerContext(searchFAQArticleContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('faq-article-vote-action', FAQArticleVoteAction);
        ActionFactory.getInstance().registerAction('load-faq-article-action', LoadFAQAricleAction);
    }

}
