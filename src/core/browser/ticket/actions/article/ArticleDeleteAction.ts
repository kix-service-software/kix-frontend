import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleDeleteAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Delete';
        this.icon = "kix-icon-mail-trash";
    }

}
