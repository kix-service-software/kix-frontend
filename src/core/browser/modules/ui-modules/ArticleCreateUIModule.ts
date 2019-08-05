/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, ActionFactory, DialogService } from '../../../../core/browser';
import {
    TicketFormService, EmailRecipientValidator, NewTicketArticleContext, ArticleReplyAction, ArticleForwardAction
} from '../../../../core/browser/ticket';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, WidgetSize
} from '../../../../core/model';
import { FormValidationService } from '../../../../core/browser/form/validation';
import { ArticleNewAction } from '../../../../core/browser/ticket/actions/article/ArticleNewAction';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 103;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
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
        ActionFactory.getInstance().registerAction('article-reply-action', ArticleReplyAction);
        ActionFactory.getInstance().registerAction('article-forward-action', ArticleForwardAction);
    }

    private registerTicketDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-article-dialog',
            new WidgetConfiguration(
                'new-ticket-article-dialog', 'Translatable#New Article', [], {},
                false, false, 'kix-icon-new-note'
            ),
            KIXObjectType.ARTICLE,
            ContextMode.CREATE_SUB
        ));
    }
}
