import { AbstractAction, KIXObjectType, ContextMode } from '../../../../model';
import { ContextService } from '../../../context';
import { RoleDetailsContext, EditUserRoleDialogContext } from '../context';

export class UserRoleEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(event: any): Promise<void> {
        const context = await ContextService.getInstance().getContext<RoleDetailsContext>(
            RoleDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditUserRoleDialogContext.CONTEXT_ID, KIXObjectType.ROLE,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
