import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class CustomerSearchAction extends AbstractAction {

    public initAction(): void {
        this.text = "Suchen";
        this.icon = "kix-icon-search";
    }

}
