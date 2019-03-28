import { AbstractAction, KIXObjectType, ContextMode } from '../../../../model';
import { ContextService } from '../../../context';

export class UserRoleEditAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.ROLE, ContextMode.EDIT_ADMIN, null, true, 'Translatable#User Management'
        );
    }

}
