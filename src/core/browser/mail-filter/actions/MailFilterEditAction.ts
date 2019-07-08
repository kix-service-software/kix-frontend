import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { EditMailFilterDialogContext, MailFilterDetailsContext } from '../context';

export class MailFilterEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/communication/mailfilters/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<MailFilterDetailsContext>(
            MailFilterDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditMailFilterDialogContext.CONTEXT_ID, KIXObjectType.MAIL_FILTER,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
