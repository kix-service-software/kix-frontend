import { AbstractAction } from '../../../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType, CRUD } from '../../../../model';
import { NewTicketArticleContext } from '../../context';
import { ContextService } from '../../../context';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';

export class ArticleNewAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('tickets/*/articles', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Article';
        this.icon = 'kix-icon-new-note';
    }

    public async run(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewTicketArticleContext.CONTEXT_ID, KIXObjectType.ARTICLE, ContextMode.CREATE_SUB,
            null, true, null, true
        );
    }

}
