import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContactDialogUtil } from '../ContactDialogUtil';

export class ContactCreateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Contact';
        this.icon = 'kix-icon-man-bubble-new';
    }

    public async run(event: any): Promise<void> {
        ContactDialogUtil.create();
    }

}
