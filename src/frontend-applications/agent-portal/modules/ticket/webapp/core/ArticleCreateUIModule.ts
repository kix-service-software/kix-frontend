/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import {
    TicketFormService, ArticleNewAction,
    ArticleReplyAction, ArticleForwardAction, ArticleGetPlainAction,
    ArticlePrintAction
} from '.';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ObjectFormRegistry } from '../../../object-forms/webapp/core/ObjectFormRegistry';
import { EmailRecipientValidator } from './form/form-values/validators/EmailRecipientValidator';

export class UIModule implements IUIModule {

    public priority: number = 103;

    public name: string = 'ArticleCreateUIModule';

    public async register(): Promise<void> {
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(EmailRecipientValidator);
        TicketFormService.getInstance();

        this.registerTicketActions();
    }

    public async registerExtensions(): Promise<void> {
        return;
    }


    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('article-new-action', ArticleNewAction);
        ActionFactory.getInstance().registerAction('article-reply-action', ArticleReplyAction);
        ActionFactory.getInstance().registerAction('article-forward-action', ArticleForwardAction);
        ActionFactory.getInstance().registerAction('article-get-plain-action', ArticleGetPlainAction);
        ActionFactory.getInstance().registerAction('article-print-action', ArticlePrintAction);
    }
}
