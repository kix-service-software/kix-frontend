import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class ContactCreateCustomerAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neuer Kunde";
        this.icon = "kix-icon-man-house-new";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.CUSTOMER, ContextMode.CREATE);
    }

}
