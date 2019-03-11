import { AbstractAction } from '../../../../model/components/action/AbstractAction';

export class ArticleBulkAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Bulk Action';
        this.icon = 'kix-icon-arrow-collect';
    }

}
