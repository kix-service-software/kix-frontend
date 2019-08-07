/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType, CRUD } from '../../../../model';
import { ContextService } from '../../../context';
import { NewTicketArticleContext } from '../../context';
import { TranslationService } from '../../../i18n/TranslationService';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';

export class ArticleReplyAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('tickets/*/articles', [CRUD.CREATE])
    ];

    private articleId: number = null;

    public hasLink: boolean = true;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Reply';
        this.icon = 'kix-icon-mail-answer-outline';
    }

    public async setData(data: any): Promise<void> {
        super.setData(data);
        if (this.data) {
            if (Array.isArray(this.data)) {
                this.articleId = this.data[0].ArticleID;
            } else if (typeof this.data === 'string' || typeof this.data === 'number') {
                this.articleId = Number(this.data);
            }
        }
    }

    public async run(event: any): Promise<void> {
        if (this.articleId) {
            await this.openDialog();
        } else {
            super.run(event);
        }
    }

    public canRun(): boolean {
        return this.articleId !== null;
    }

    public async getLinkData(): Promise<string> {
        return this.articleId.toString();
    }
    private async openDialog(): Promise<void> {
        if (this.articleId) {
            const context = await ContextService.getInstance().getContext(NewTicketArticleContext.CONTEXT_ID);
            if (context) {
                context.reset();
                context.setAdditionalInformation('REFERENCED_ARTICLE_ID', this.articleId);
                context.setAdditionalInformation('ARTICLE_REPLY', true);
                context.setAdditionalInformation(
                    'NEW_ARTICLE_TAB_TITLE', await TranslationService.translate('Translatable#Reply')
                );
                context.setAdditionalInformation('NEW_ARTICLE_TAB_ICON', 'kix-icon-mail-answer-outline');
            }
            ContextService.getInstance().setDialogContext(
                NewTicketArticleContext.CONTEXT_ID, KIXObjectType.ARTICLE, ContextMode.CREATE_SUB,
                this.articleId, false, null, true
            );
        }
    }
}
