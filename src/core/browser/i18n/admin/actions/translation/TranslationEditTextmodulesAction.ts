import { AbstractAction } from "../../../../../model";

export class TranslationEditTextmodulesAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

}
