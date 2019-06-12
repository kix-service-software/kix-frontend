import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../../../model';
import { ContextService } from '../../../../context';
import { NewTranslationDialogContext } from '../../context';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';

export class TranslationCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/i18n/translations', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Translation';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewTranslationDialogContext.CONTEXT_ID, KIXObjectType.TRANSLATION,
            ContextMode.CREATE_ADMIN, null, true, 'Translatable#Internationalisation',
            undefined, 'new-translation-form'
        );
    }

}
