import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { OrganisationDialogUtil } from '../../organisation';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD } from '../../../model';

export class ContactCreateOrganisationAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('organisations', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Organisation';
        this.icon = 'kix-icon-man-house-new';
    }

    public async run(event: any): Promise<void> {
        OrganisationDialogUtil.create();
    }

}
