import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleEditAction extends AbstractAction {

    public initAction(): void {
        this.text = "Bearbeiten";
        this.icon = "kix-icon-edit";
    }

}
