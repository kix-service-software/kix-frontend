import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class CustomerSearchAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Search';
        this.icon = 'kix-icon-search';
    }

}
