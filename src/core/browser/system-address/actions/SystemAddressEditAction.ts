import { AbstractAction, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../..';
import { EditSystemAddressDialogContext, SystemAddressDetailsContext } from '../context';

export class SystemAddressEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(event: any): Promise<void> {
        const context = await ContextService.getInstance().getContext<SystemAddressDetailsContext>(
            SystemAddressDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditSystemAddressDialogContext.CONTEXT_ID, KIXObjectType.SYSTEM_ADDRESS,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }
}
