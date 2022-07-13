/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { FormValidationService } from '../../../../modules/base-components/webapp/core/FormValidationService';
import {
    EmailRecipientValidator, TicketFormService, ArticleNewAction,
    ArticleReplyAction, ArticleForwardAction, ArticleGetPlainAction
} from '.';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';

export class UIModule implements IUIModule {

    public priority: number = 103;

    public name: string = 'ArticleCreateUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        TicketFormService.getInstance();

        this.registerTicketActions();
    }


    private registerTicketActions(): void {
        ActionFactory.getInstance().registerAction('article-new-action', ArticleNewAction);
        ActionFactory.getInstance().registerAction('article-reply-action', ArticleReplyAction);
        ActionFactory.getInstance().registerAction('article-forward-action', ArticleForwardAction);
        ActionFactory.getInstance().registerAction('article-get-plain-action', ArticleGetPlainAction);
    }
}
