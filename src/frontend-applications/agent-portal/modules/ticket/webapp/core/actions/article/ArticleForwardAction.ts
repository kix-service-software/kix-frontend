/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { EditTicketDialogContext } from '../..';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { AuthenticationSocketClient } from '../../../../../base-components/webapp/core/AuthenticationSocketClient';
import { AdditionalContextInformation } from '../../../../../base-components/webapp/core/AdditionalContextInformation';
import { Article } from '../../../../model/Article';

export class ArticleForwardAction extends AbstractAction<Article> {

    private articleId: number = null;
    private ticketId: number = null;

    public hasLink: boolean = true;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Forward';
        this.icon = 'kix-icon-mail-forward-outline';
    }

    public async canShow(): Promise<boolean> {
        let show = false;
        const context = ContextService.getInstance().getActiveContext();
        const objectId = context.getObjectId();

        if (objectId) {
            this.ticketId = Number(objectId);
            const permissions = [
                new UIComponentPermission(`tickets/${objectId}/articles`, [CRUD.CREATE])
            ];
            show = await AuthenticationSocketClient.getInstance().checkPermissions(permissions);
        }

        return show;
    }

    public async setData(data: Article): Promise<void> {
        super.setData(data);
        this.articleId = this.data?.ArticleID;
    }

    public async run(event: any): Promise<void> {
        if (this.articleId) {
            await this.openDialog();
        } else {
            super.run(event);
        }
    }

    public canRun(): boolean {
        return this.articleId !== null && this.ticketId !== null;
    }

    public async getLinkData(): Promise<string> {
        return this.articleId.toString();
    }

    private async openDialog(): Promise<void> {
        if (this.articleId) {
            const editContext = await ContextService.getInstance().setActiveContext(EditTicketDialogContext.CONTEXT_ID,
                this.ticketId, undefined,
                [
                    ['REFERENCED_SOURCE_OBJECT_ID', this.ticketId],
                    ['REFERENCED_ARTICLE_ID', this.articleId],
                    ['ARTICLE_FORWARD', true],
                    [AdditionalContextInformation.FORM_ID, 'article-forward']
                ]
            );
            editContext.setIcon(this.icon);
            editContext.setDisplayText(await TranslationService.translate(this.text));
        }
    }
}
