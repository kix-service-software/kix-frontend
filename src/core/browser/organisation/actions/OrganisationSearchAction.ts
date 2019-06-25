import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD } from '../../../model';

export class OrganisationSearchAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('organisations', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Search';
        this.icon = 'kix-icon-search';
    }

}
