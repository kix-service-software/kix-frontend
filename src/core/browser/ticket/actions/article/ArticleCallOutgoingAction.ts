import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleCallOutgoingAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Phone outbound';
        this.icon = 'kix-icon-call-outward';
    }

}
