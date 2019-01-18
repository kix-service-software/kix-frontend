import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleTagAction extends AbstractAction {

    public initAction(): void {
        this.text = "Tag";
        this.icon = "kix-icon-flag";
    }

}
