import { AbstractAction, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class SystemAddressCreateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Address';
        this.icon = 'kix-icon-new-gear';
    }

    // public async run(event: any): Promise<void> {
    //     ContextService.getInstance().setDialogContext(
    //         // TODO: Titel aus dem aktiven Admin-Modul ermitteln
    //         null, KIXObjectType.SYSTEM_ADDRESS, ContextMode.CREATE_ADMIN, null, true,
    //         'Translatable#System Addresses', undefined, 'new-system-address-form'
    //     );
    // }

}
