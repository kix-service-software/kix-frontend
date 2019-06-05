import { AbstractAction, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class TextModuleCreateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Text Module';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.TEXT_MODULE, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#Ticket', undefined, 'new-text-module-form'
        );
    }

}
