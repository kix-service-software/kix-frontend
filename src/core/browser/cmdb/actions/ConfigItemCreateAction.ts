import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class ConfigItemCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neues Config Item";
        this.icon = "kix-icon-new-ci";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.CONFIG_ITEM, ContextMode.CREATE);
    }

}
