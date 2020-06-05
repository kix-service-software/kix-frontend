/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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

export class UIModule implements IUIModule {

    public priority: number = 402;

    public name: string = 'FAQEditUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }


    public async register(): Promise<void> {
        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const newFAQArticleContext = new ContextDescriptor(
            NewFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-faq-article-dialog', ['faqarticles'], NewFAQArticleDialogContext
        );
        await ContextService.getInstance().registerContext(newFAQArticleContext);

        const editFAQArticleContext = new ContextDescriptor(
            EditFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-faq-article-dialog', ['faqarticles'], EditFAQArticleDialogContext
        );
        await ContextService.getInstance().registerContext(editFAQArticleContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('faq-article-create-action', FAQArticleCreateAction);
        ActionFactory.getInstance().registerAction('faq-article-delete-action', FAQArticleDeleteAction);
        ActionFactory.getInstance().registerAction('faq-article-edit-action', FAQArticleEditAction);
    }

}
