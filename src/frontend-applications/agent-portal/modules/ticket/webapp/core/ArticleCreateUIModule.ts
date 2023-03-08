/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(EmailRecipientValidator);
        TicketFormService.getInstance();

        this.registerTicketActions();
    }


    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('article-new-action', ArticleNewAction);
        ActionFactory.getInstance().registerAction('article-reply-action', ArticleReplyAction);
        ActionFactory.getInstance().registerAction('article-forward-action', ArticleForwardAction);
        ActionFactory.getInstance().registerAction('article-get-plain-action', ArticleGetPlainAction);
        ActionFactory.getInstance().registerAction('article-print-action', ArticlePrintAction);
    }
}
