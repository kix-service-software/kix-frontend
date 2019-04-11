import { AbstractAction, FormInstance, KIXObjectType, ContextMode } from '../../../../model';
import { FormService } from '../../../form';
import { ContextService } from '../../../context';

export class UserEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit Agent';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-user-form', false);
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.USER, ContextMode.EDIT_ADMIN, null, true
        );
    }

}
