import { AbstractAction } from "../../../model";

export class ConfigItemVersionMaximizeAction extends AbstractAction {

    public initAction(): void {
        this.text = "Großansicht";
        this.icon = "kix-icon-arrow-split2";
    }

}
