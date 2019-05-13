import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, FormValidationService, ContextService, ActionFactory, DialogService
} from '../../../../core/browser';
import {
    TicketFormService, EmailRecipientValidator, NewTicketArticleContext, ArticleNewNoteAction, ArticleNewEmailAction
} from '../../../../core/browser/ticket';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, WidgetSize
} from '../../../../core/model';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        TicketFormService.getInstance();

        this.registerContexts();
        this.registerTicketActions();
        this.registerTicketDialogs();
    }

    private registerContexts(): void {
        const newTicketArticleContext = new ContextDescriptor(
            NewTicketArticleContext.CONTEXT_ID, [KIXObjectType.ARTICLE], ContextType.DIALOG, ContextMode.CREATE_SUB,
            true, 'new-ticket-article-dialog', ['articles'], NewTicketArticleContext
        );
        ContextService.getInstance().registerContext(newTicketArticleContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('article-new-email-action', ArticleNewEmailAction);
        ActionFactory.getInstance().registerAction('article-new-note-action', ArticleNewNoteAction);
    }

    private registerTicketDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-article-dialog',
            new WidgetConfiguration(
                'new-ticket-article-dialog', 'Translatable#New Article', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-new-note'
            ),
            KIXObjectType.ARTICLE,
            ContextMode.CREATE_SUB
        ));
    }
}

module.exports = Component;
