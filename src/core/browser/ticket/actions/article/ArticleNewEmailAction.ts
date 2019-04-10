import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleNewEmailAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#New E-mail';
        this.icon = 'kix-icon-new-mail';
    }

}
