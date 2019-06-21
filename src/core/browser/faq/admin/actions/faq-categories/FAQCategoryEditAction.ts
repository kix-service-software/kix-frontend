import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../../../model';
import { ContextService } from '../../../../context';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { FAQCategoryDetailsContext, EditFAQCategoryDialogContext } from '../../context';

export class FAQCategoryEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/faq/categories/*', [CRUD.UPDATE])
    ];

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
