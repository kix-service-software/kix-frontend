import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class ContactSearchAction extends AbstractAction {

    public initAction(): void {
        this.text = "Suchen";
        this.icon = "kix-icon-search";
    }

}
