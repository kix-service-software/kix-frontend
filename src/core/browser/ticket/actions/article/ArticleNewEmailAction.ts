import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleNewEmailAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Email';
        this.icon = 'kix-icon-new-mail';
    }

}
