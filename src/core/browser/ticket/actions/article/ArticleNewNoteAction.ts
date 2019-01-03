import { AbstractAction } from '../../../../model/components/action/AbstractAction';
import { DialogService } from '../../../dialog';
import { ContextMode, KIXObjectType } from '../../../../model';

export class ArticleNewNoteAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neuer Artikel";
        this.icon = "kix-icon-new-note";
    }

    public async run(): Promise<void> {
        DialogService.getInstance().openMainDialog(
            ContextMode.CREATE_SUB, 'new-ticket-article-dialog', KIXObjectType.ARTICLE, null, null, true
        );
    }

}
