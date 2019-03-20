import { AbstractAction, KIXObjectType, ContextMode } from '../../../../model';
import { ContextService } from '../../../context';

export class ConfigItemClassCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#New CMDB Klasse';
        this.icon = 'kix-icon-new-gear';
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.CONFIG_ITEM_CLASS, ContextMode.CREATE_ADMIN, null, true, 'Add Core Data'
        );
    }

}
