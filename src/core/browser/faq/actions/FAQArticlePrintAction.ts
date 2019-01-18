import { AbstractAction } from "../../../model";

export class FAQArticlePrintAction extends AbstractAction {

    public initAction(): void {
        this.text = "Drucken";
        this.icon = "kix-icon-print";
    }

}
