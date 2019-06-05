import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../model';
import { ContextService } from '../..';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class SystemAddressEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('ticketstates', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.SYSTEM_ADDRESS, ContextMode.EDIT_ADMIN, null, true
        );
    }
}
