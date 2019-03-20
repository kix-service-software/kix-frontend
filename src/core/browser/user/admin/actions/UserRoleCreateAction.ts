import { AbstractAction, KIXObjectType, ContextMode } from '../../../../model';
import { ContextService } from '../../../context';

export class UserRoleCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#New Role';
        this.icon = 'kix-icon-new-gear';
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.ROLE, ContextMode.CREATE_ADMIN, null, true, 'Translatable#User Management'
        );
    }

}
