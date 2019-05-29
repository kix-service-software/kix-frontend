import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleMaximizeAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Large View';
        this.icon = 'kix-icon-arrow-split2';
    }

}
