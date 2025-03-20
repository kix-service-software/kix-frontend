/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQArticleCreateAction, FAQArticleDeleteAction, FAQArticleEditAction } from '../actions';
import { IUIModule } from '../../../../../model/IUIModule';
import { ContextDescriptor } from '../../../../../model/ContextDescriptor';
import { NewFAQArticleDialogContext, EditFAQArticleDialogContext } from '..';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../../model/ContextType';
import { ContextMode } from '../../../../../model/ContextMode';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { FAQDetailsContext } from '../context/FAQDetailsContext';

export class UIModule implements IUIModule {

    public priority: number = 402;

    public name: string = 'FAQEditUIModule';

    public async register(): Promise<void> {
        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const newFAQArticleContext = new ContextDescriptor(
            NewFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.CREATE,
            false, 'object-dialog', ['faqarticles'], NewFAQArticleDialogContext,
            [
                new UIComponentPermission('faq/articles', [CRUD.CREATE])
            ],
            'Translatable#FAQ', 'kix-icon-faq', FAQDetailsContext.CONTEXT_ID, 400
        );
        ContextService.getInstance().registerContext(newFAQArticleContext);

        const editFAQArticleContext = new ContextDescriptor(
            EditFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.EDIT,
            false, 'object-dialog', ['faqarticles'], EditFAQArticleDialogContext,
            [
                new UIComponentPermission('faq/articles', [CRUD.CREATE])
            ],
            'Translatable#FAQ', 'kix-icon-gear', FAQDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(editFAQArticleContext);
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('faq-article-create-action', FAQArticleCreateAction);
        ActionFactory.getInstance().registerAction('faq-article-delete-action', FAQArticleDeleteAction);
        ActionFactory.getInstance().registerAction('faq-article-edit-action', FAQArticleEditAction);
    }

}
