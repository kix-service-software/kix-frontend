import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleCallIncomingAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Phone inbound';
        this.icon = 'kix-icon-call-receive';
    }

}
