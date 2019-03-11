import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class ContactSearchAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Search';
        this.icon = 'kix-icon-search';
    }

}
