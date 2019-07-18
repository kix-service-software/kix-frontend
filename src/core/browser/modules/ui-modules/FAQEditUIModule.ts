/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, ActionFactory } from '../../../../core/browser';
import {
    KIXObjectType, ContextType, ContextMode, ContextDescriptor, ConfiguredDialogWidget,
    WidgetConfiguration
} from '../../../../core/model';
import {
    NewFAQArticleDialogContext, FAQArticleEditAction, FAQArticleDeleteAction,
    FAQArticleCreateAction, EditFAQArticleDialogContext
} from '../../../../core/browser/faq';
import { DialogService } from '../../../../core/browser/components/dialog';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 402;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }


    public async register(): Promise<void> {
        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
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
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-faq-article-dialog',
            new WidgetConfiguration(
                'new-faq-article-dialog', 'Translatable#New FAQ', [], {},
                false, false, 'kix-icon-new-faq'
            ),
            KIXObjectType.FAQ_ARTICLE,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-faq-article-dialog',
            new WidgetConfiguration(
                'edit-faq-article-dialog', 'Translatable#Edit FAQ Article', [], {}, false,
                false, 'kix-icon-edit'
            ),
            KIXObjectType.FAQ_ARTICLE,
            ContextMode.EDIT
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('faq-article-create-action', FAQArticleCreateAction);
        ActionFactory.getInstance().registerAction('faq-article-delete-action', FAQArticleDeleteAction);
        ActionFactory.getInstance().registerAction('faq-article-edit-action', FAQArticleEditAction);
    }

}
