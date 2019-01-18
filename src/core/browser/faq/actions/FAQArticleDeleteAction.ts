import { AbstractAction } from "../../../model";

export class FAQArticleDeleteAction extends AbstractAction {

    public initAction(): void {
        this.text = "Löschen";
        this.icon = "kix-icon-trash";
    }

}
