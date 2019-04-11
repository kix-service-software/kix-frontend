import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleTagAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Tag';
        this.icon = 'kix-icon-flag';
    }

}
