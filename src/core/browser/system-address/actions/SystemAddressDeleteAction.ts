import { AbstractAction, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class SystemAddressDeleteAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Delete';
        this.icon = "kix-icon-trash";
    }

}
