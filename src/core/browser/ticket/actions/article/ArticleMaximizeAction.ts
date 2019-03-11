import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleMaximizeAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Large View';
        this.icon = 'kix-icon-arrow-split2';
    }

}
