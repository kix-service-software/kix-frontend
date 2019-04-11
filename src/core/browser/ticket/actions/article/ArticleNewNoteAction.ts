import { AbstractAction } from '../../../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType } from '../../../../model';
import { DialogService } from '../../../components/dialog';

export class ArticleNewNoteAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Article';
        this.icon = 'kix-icon-new-note';
    }

    public async run(): Promise<void> {
        DialogService.getInstance().openMainDialog(
            ContextMode.CREATE_SUB, 'new-ticket-article-dialog', KIXObjectType.ARTICLE, null, null, true
        );
    }

}
