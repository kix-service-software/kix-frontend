import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleCommunicationAction extends AbstractAction {

    public initAction(): void {
        this.text = "Kommunikation";
        this.icon = "kix-icon-mail-redirect";
    }

}
