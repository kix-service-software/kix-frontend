import { AbstractAction, FormInstance, KIXObjectType, ContextMode } from '../../../../model';
import { FormService } from '../../../form';
import { ContextService } from '../../../context';
import { UserDetailsContext, EditUserDialogContext } from '../context';

export class UserEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit Agent';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<UserDetailsContext>(
            UserDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditUserDialogContext.CONTEXT_ID, KIXObjectType.USER,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
