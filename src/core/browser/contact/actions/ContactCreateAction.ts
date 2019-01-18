import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class ContactCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neuer Ansprechpartner";
        this.icon = "kix-icon-man-bubble-new";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.CONTACT, ContextMode.CREATE, null, true);
    }

}
