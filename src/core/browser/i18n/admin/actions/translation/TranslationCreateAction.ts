import { AbstractAction, KIXObjectType, ContextMode } from '../../../../../model';
import { ContextService } from '../../../../context';
import { NewTranslationDialogContext } from '../../context';

export class TranslationCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#New Translation';
        this.icon = 'kix-icon-new-gear';
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(
            NewTranslationDialogContext.CONTEXT_ID, KIXObjectType.TRANSLATION,
            ContextMode.CREATE_ADMIN, null, true, 'Internationalisierung'
        );
    }

}
