import { AbstractAction } from "../../../../../model";

export class TranslationEditTextmodulesAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

}
