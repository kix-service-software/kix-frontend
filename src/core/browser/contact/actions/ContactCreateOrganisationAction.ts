import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { OrganisationDialogUtil } from '../../organisation';

export class ContactCreateOrganisationAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Organisation';
        this.icon = 'kix-icon-man-house-new';
    }

    public async run(event: any): Promise<void> {
        OrganisationDialogUtil.create();
    }

}
