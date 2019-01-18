import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleCallOutgoingAction extends AbstractAction {

    public initAction(): void {
        this.text = "Anruf ausgehend";
        this.icon = "kix-icon-call-outward";
    }

}
