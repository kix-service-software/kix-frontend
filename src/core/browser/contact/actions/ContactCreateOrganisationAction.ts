import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class ContactCreateOrganisationAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Organisation';
        this.icon = 'kix-icon-man-house-new';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.ORGANISATION, ContextMode.CREATE, null, true,
            undefined, undefined, 'new-organisation-form'
        );
    }

}
