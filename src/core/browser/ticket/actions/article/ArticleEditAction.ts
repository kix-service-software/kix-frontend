import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

}
