import { AbstractAction, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../..';

export class SystemAddressEditAction extends AbstractAction {

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
