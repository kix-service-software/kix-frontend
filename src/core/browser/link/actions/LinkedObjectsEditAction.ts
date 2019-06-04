import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { EditLinkedObjectsDialogContext } from '../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class LinkedObjectsEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('links', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Links';
        this.icon = 'kix-icon-link';
    }

    public async run(): Promise<void> {
        await ContextService.getInstance().setDialogContext(
            EditLinkedObjectsDialogContext.CONTEXT_ID,
            KIXObjectType.LINK,
            ContextMode.EDIT_LINKS
        );
    }
}
