import { AbstractAction } from "../../../model";

export class SearchResultPrintAction extends AbstractAction {

    public initAction(): void {
        this.text = "Drucken";
        this.icon = "kix-icon-print";
    }

}
