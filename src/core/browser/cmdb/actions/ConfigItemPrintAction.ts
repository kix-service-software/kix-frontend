import { AbstractAction } from "../../../model";

export class ConfigItemPrintAction extends AbstractAction {

    public initAction(): void {
        this.text = "Drucken";
        this.icon = "kix-icon-print";
    }

}
