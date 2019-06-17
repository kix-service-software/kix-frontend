import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, ContextService, ActionFactory, DialogService
} from '../../../../core/browser';
import {
    TicketFormService, EmailRecipientValidator, NewTicketArticleContext
} from '../../../../core/browser/ticket';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, WidgetSize
} from '../../../../core/model';
import { FormValidationService } from '../../../../core/browser/form/validation';
import { ArticleNewAction } from '../../../../core/browser/ticket/actions/article/ArticleNewAction';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
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
        ActionFactory.getInstance().registerAction('article-new-action', ArticleNewAction);
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
