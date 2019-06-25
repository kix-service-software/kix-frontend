import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { OrganisationDialogUtil } from '../OrganisationDialogUtil';

export class OrganisationCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
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
