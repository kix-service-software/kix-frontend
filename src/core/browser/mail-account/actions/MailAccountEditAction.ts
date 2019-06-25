import { AbstractAction, FormInstance, KIXObjectType, ContextMode } from '../../../model';
import { FormService } from '../../form';
import { ContextService } from '../../context';
import { EditMailAccountDialogContext, MailAccountDetailsContext } from '../context';

export class MailAccountEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<MailAccountDetailsContext>(
            MailAccountDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditMailAccountDialogContext.CONTEXT_ID, KIXObjectType.MAIL_ACCOUNT,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
