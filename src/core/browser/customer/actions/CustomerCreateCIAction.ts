import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class CustomerCreateCIAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neues Config Item";
        this.icon = "kix-icon-cmdb";
    }

}
