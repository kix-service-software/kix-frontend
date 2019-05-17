import { AbstractAction } from '../../../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType } from '../../../../model';
import { NewTicketArticleContext } from '../../context';
import { ContextService } from '../../../context';

export class ArticleNewAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Article';
        this.icon = 'kix-icon-new-note';
    }

    public async run(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewTicketArticleContext.CONTEXT_ID, KIXObjectType.ARTICLE, ContextMode.CREATE_SUB,
            null, true, null, true, 'new-ticket-article-form'
        );
    }

}
