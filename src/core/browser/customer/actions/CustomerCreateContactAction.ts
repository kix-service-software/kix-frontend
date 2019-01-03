import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class CustomerCreateContactAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neuer Ansprechpartner";
        this.icon = "kix-icon-man-house-new";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.CONTACT, ContextMode.CREATE);
    }

}
