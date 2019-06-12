import { AbstractAction, FormInstance, KIXObjectType, ContextMode, CRUD } from '../../../../../model';
import { FormService } from '../../../../form';
import { ContextService } from '../../../../context';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';

export class FAQCategoryEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/faq/categories/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-faq-category-form', false);
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.FAQ_CATEGORY, ContextMode.EDIT_ADMIN, null, true
        );
    }

}
