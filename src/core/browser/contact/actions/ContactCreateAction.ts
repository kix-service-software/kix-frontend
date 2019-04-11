import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class ContactCreateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Contact';
        this.icon = 'kix-icon-man-bubble-new';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.CONTACT, ContextMode.CREATE, null, true);
    }

}
