import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { FormService } from '../../form';
import { FormInstance, ContextMode, KIXObjectType, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class OrganisationEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('organisations', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-organisation-form', false);
        ContextService.getInstance().setDialogContext(null, KIXObjectType.ORGANISATION, ContextMode.EDIT, null, true);
    }

}
