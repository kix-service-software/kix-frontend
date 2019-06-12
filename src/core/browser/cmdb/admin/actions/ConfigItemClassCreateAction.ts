import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../../model';
import { ContextService } from '../../../context';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';

export class ConfigItemClassCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Class';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.CONFIG_ITEM_CLASS, ContextMode.CREATE_ADMIN, null, true, 'Translatable#CMDB',
            undefined, 'new-config-item-class-form'
        );
    }

}
