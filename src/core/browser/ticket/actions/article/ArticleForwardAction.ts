import { AbstractAction } from '../../../../model/components/action/AbstractAction';
import { Article, ContextMode, KIXObjectType } from '../../../../model';
import { ContextService } from '../../../context';
import { NewTicketArticleContext } from '../../context';
import { TranslationService } from '../../../i18n/TranslationService';

export class ArticleForwardAction extends AbstractAction {

    private article: Article = null;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Forward';
        this.icon = 'kix-icon-mail-forward-outline';
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            this.article = this.data[0];
            if (this.article) {
                await this.openDialog();
            } else {
                super.run(event);
            }
        }
    }

    public canRun(): boolean {
        return this.data && Array.isArray(this.data) ? true : false;
    }

    private async openDialog(): Promise<void> {
        if (this.article) {
            const context = await ContextService.getInstance().getContext(NewTicketArticleContext.CONTEXT_ID);
            if (context) {
                context.reset();
                context.setAdditionalInformation('REFERENCED_ARTICLE_ID', this.article.ArticleID);
                context.setAdditionalInformation('ARTICLE_FORWARD', true);
                context.setAdditionalInformation(
                    'NEW_ARTICLE_TAB_TITLE', await TranslationService.translate('Translatable#Forward')
                );
                context.setAdditionalInformation('NEW_ARTICLE_TAB_ICON', 'kix-icon-mail-forward-outline');
            }
            ContextService.getInstance().setDialogContext(
                NewTicketArticleContext.CONTEXT_ID, KIXObjectType.ARTICLE, ContextMode.CREATE_SUB,
                this.article.ArticleID, false, null, true
            );
        }
    }
}
