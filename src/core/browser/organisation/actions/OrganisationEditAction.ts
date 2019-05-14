import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { FormService } from '../../form';
import { FormInstance, ContextMode, KIXObjectType } from '../../../model';
import { ContextService } from '../../context';

export class OrganisationEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-organisation-form', false);
        ContextService.getInstance().setDialogContext(null, KIXObjectType.ORGANISATION, ContextMode.EDIT, null, true);
    }

}
