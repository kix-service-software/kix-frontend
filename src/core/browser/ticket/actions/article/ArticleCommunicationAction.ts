import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleCommunicationAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Communication';
        this.icon = 'kix-icon-mail-redirect';
    }

}
