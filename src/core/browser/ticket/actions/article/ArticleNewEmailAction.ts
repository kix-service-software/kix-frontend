import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleNewEmailAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neue E-Mail";
        this.icon = "kix-icon-new-mail";
    }

}
