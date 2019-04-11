import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class CustomerCreateCIAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Config Item';
        this.icon = 'kix-icon-cmdb';
    }

}
