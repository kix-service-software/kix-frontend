import { AbstractAction, FormInstance, KIXObjectType, ContextMode } from '../../../../../model';
import { FormService } from '../../../../form';
import { ContextService } from '../../../../context';
import { FAQCategoryDetailsContext, EditFAQCategoryDialogContext } from '../../context';

export class FAQCategoryEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<FAQCategoryDetailsContext>(
            FAQCategoryDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditFAQCategoryDialogContext.CONTEXT_ID, KIXObjectType.FAQ_CATEGORY,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
