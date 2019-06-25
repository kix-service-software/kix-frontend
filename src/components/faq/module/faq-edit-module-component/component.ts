import {
    AbstractMarkoComponent, ContextService, ActionFactory
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, ContextType, ContextMode, ContextDescriptor, ConfiguredDialogWidget,
    WidgetConfiguration, WidgetSize
} from '../../../../core/model';
import {
    NewFAQArticleDialogContext, FAQArticleEditAction, FAQArticleDeleteAction,
    FAQArticleCreateAction, EditFAQArticleDialogContext
} from '../../../../core/browser/faq';
import { DialogService } from '../../../../core/browser/components/dialog';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
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
                false, false, WidgetSize.BOTH, 'kix-icon-new-faq'
            ),
            KIXObjectType.FAQ_ARTICLE,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-faq-article-dialog',
            new WidgetConfiguration(
                'edit-faq-article-dialog', 'Translatable#Edit FAQ Article', [], {}, false,
                false, WidgetSize.BOTH, 'kix-icon-edit'
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

module.exports = Component;
