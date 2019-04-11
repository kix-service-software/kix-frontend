import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode, FormInstance } from '../../../model';
import { FormService } from '../../form';

export class ContactEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-contact-form', false);
        ContextService.getInstance().setDialogContext(null, KIXObjectType.CONTACT, ContextMode.EDIT, null, true);
    }

}
