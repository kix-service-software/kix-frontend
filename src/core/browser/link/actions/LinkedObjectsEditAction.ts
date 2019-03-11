import { AbstractAction, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';
import { EditLinkedObjectsDialogContext } from '../context';

export class LinkedObjectsEditAction extends AbstractAction {

    public initAction(): void {
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
